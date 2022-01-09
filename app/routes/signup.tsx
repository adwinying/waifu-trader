import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useTransition,
} from "remix";
import { z } from "zod";
import { RefreshIcon } from "@heroicons/react/outline";
import db from "~/utils/db.server";
import registerUser from "~/libs/user/registerUser";
import { commitSession } from "~/utils/session.server";
import { createUserSession, getAuthUser } from "~/utils/auth.server";
import FormText from "~/components/FormText";
import PageTitle from "~/components/PageTitle";

export const validationSchema = z
  .object({
    name: z.string().nonempty(),
    email: z
      .string()
      .email()
      .refine(async (email) => {
        const existingUserWithEmail = await db.user.findUnique({
          where: { email },
        });

        return existingUserWithEmail === null;
      }, "Email already in use"),
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
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

  const user = await registerUser(validation.data);

  const session = await createUserSession(user);

  session.flash("notification", {
    type: "success",
    message: "You have successfully signed up!",
  });

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthUser(request);

  if (user) return redirect("/");

  return {};
};

export default function SignUpRoute() {
  const actionData: ActionData | undefined = useActionData();
  const transition = useTransition();

  return (
    <div>
      <PageTitle>Sign Up</PageTitle>

      <Form method="post" className="w-full sm:w-80">
        <FormText
          name="name"
          label="Name"
          defaultValue={actionData?.data.name}
          errors={actionData?.errors.name}
          placeholder="Keima Katsuragi"
          disabled={transition.state === "submitting"}
        />

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

        <FormText
          name="passwordConfirmation"
          label="Password (Confirm)"
          defaultValue={actionData?.data.passwordConfirmation}
          errors={actionData?.errors.passwordConfirmation}
          type="password"
          placeholder="********"
          disabled={transition.state === "submitting"}
        />

        <button
          type="submit"
          className="mt-5 btn btn-primary"
          disabled={transition.state === "submitting"}
        >
          {transition.state === "submitting" ? (
            <>
              <RefreshIcon className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </Form>
    </div>
  );
}
