import {
  ActionFunction,
  Form,
  LoaderFunction,
  MetaFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import { z } from "zod";
import FormSubmitButton from "~/components/FormSubmitButton";
import FormText from "~/components/FormText";
import PageTitle from "~/components/PageTitle";
import authenticateUser from "~/libs/user/authenticateUser";
import { createUserSession, getAuthUser } from "~/utils/auth.server";
import { commitSession } from "~/utils/session.server";

export const meta: MetaFunction = () => ({
  title: "Login - Waifu Trader",
});

export const validationSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty(),
});

type ActionData = {
  errors: Record<keyof z.infer<typeof validationSchema>, string[]>;
  data: z.infer<typeof validationSchema>;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const validation = await validationSchema.safeParseAsync(data);

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors, data };
  }

  const { email, password } = validation.data;
  const user = await authenticateUser({ email, password });

  if (!user) {
    return { errors: { email: ["Invalid email or password"] }, data };
  }

  const session = await createUserSession(user);

  session.flash("notification", {
    type: "success",
    message: "You have successfully logged in!",
  });

  const redirectUrl = new URL(request.url).searchParams.get("redirect") ?? "/";

  return redirect(redirectUrl, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

type LoaderData = {
  postUrl: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthUser(request);

  if (user) return redirect("/");

  const url = new URL(request.url);

  return {
    postUrl: `${url.pathname}?${url.searchParams.toString()}`,
  };
};

export default function Login() {
  const { postUrl } = useLoaderData<LoaderData>();
  const actionData: ActionData | undefined = useActionData();
  const transition = useTransition();

  return (
    <div>
      <PageTitle>Login</PageTitle>

      <Form method="post" action={postUrl} className="w-full sm:w-80">
        <FormText
          name="email"
          label="Email"
          defaultValue={actionData?.data.email}
          errors={actionData?.errors.email}
          placeholder="email@example.org"
          disabled={transition.state === "submitting"}
        />

        <FormText
          name="password"
          label="Password"
          type="password"
          defaultValue={actionData?.data.password}
          errors={actionData?.errors.password}
          placeholder="********"
          disabled={transition.state === "submitting"}
        />

        <FormSubmitButton isSubmitting={transition.state === "submitting"} />
      </Form>
    </div>
  );
}
