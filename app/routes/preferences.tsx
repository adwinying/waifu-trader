import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import { z } from "zod";
import { zfd } from "zod-form-data";
import FormText from "~/components/FormText";
import PageTitle from "~/components/PageTitle";
import updateUser from "~/libs/user/updateUser";
import { getAuthUser } from "~/utils/auth.server";
import { commitSession, getSession } from "~/utils/session.server";
import db from "~/utils/db.server";
import FormSubmitButton from "~/components/FormSubmitButton";

export const validationSchema = z
  .object({
    user: z.object({
      email: z.string(),
      password: z.string(),
    }),
    name: z.string().nonempty(),
    email: z.string().email(),
    currentPassword: zfd.text(z.string().nullish()),
    newPassword: zfd.text(z.string().min(8).nullish()),
    passwordConfirmation: zfd.text(z.string().min(8).nullish()),
  })
  .refine(
    async ({ email, user }) => {
      if (user.email === email) return true;

      const existingUserWithEmail = await db.user.findFirst({
        where: {
          AND: [{ email }, { NOT: { email: user.email } }],
        },
      });

      return existingUserWithEmail === null;
    },
    { message: "Email already in use", path: ["email"] },
  )
  .refine(
    (data) => {
      if (!data.newPassword) return true;

      return !!data.currentPassword;
    },
    {
      message: "Current Password is required",
      path: ["currentPassword"],
    },
  )
  .refine(
    (data) => {
      if (!data.currentPassword) return true;

      return bcrypt.compareSync(data.currentPassword, data.user.password);
    },
    {
      message: "Current Password is incorrect",
      path: ["currentPassword"],
    },
  )
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

type ActionData = {
  errors: Record<keyof z.infer<typeof validationSchema>, string[]>;
  data: z.infer<typeof validationSchema>;
};

export const action: ActionFunction = async ({ request }) => {
  const user = await getAuthUser(request);

  if (!user) return redirect("/login");

  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const validation = await validationSchema.safeParseAsync({ ...data, user });

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors, data };
  }

  await updateUser({
    user,
    name: validation.data.name ?? undefined,
    email: validation.data.email ?? undefined,
    password: validation.data.newPassword ?? undefined,
  });

  const session = await getSession(request.headers.get("cookie"));

  session.flash("notification", {
    type: "success",
    message: "Preferences updated.",
  });

  return redirect("/preferences", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

type LoaderData = {
  user: User;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthUser(request);

  if (!user) return redirect("/login");

  return { user };
};

export default function Preferences() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  return (
    <div>
      <PageTitle>Preferences</PageTitle>

      <Form method="post" className="w-full sm:w-80">
        <FormText
          name="name"
          label="Name"
          defaultValue={actionData?.data.name ?? user.name}
          errors={actionData?.errors.name}
          placeholder="Keima Katsuragi"
          disabled={transition.state === "submitting"}
        />

        <FormText
          name="email"
          label="Email"
          defaultValue={actionData?.data.email ?? user.email}
          errors={actionData?.errors.email}
          placeholder="email@example.org"
          disabled={transition.state === "submitting"}
        />

        <FormText
          name="currentPassword"
          label="Current Password"
          type="password"
          defaultValue={actionData?.data.currentPassword ?? ""}
          errors={actionData?.errors.currentPassword}
          placeholder="********"
          disabled={transition.state === "submitting"}
        />

        <FormText
          name="newPassword"
          label="New Password"
          type="password"
          defaultValue={actionData?.data.newPassword ?? ""}
          errors={actionData?.errors.newPassword}
          placeholder="********"
          disabled={transition.state === "submitting"}
        />

        <FormText
          name="passwordConfirmation"
          label="New Password (Confirm)"
          defaultValue={actionData?.data.passwordConfirmation ?? ""}
          errors={actionData?.errors.passwordConfirmation}
          type="password"
          placeholder="********"
          disabled={transition.state === "submitting"}
        />

        <FormSubmitButton isSubmitting={transition.state === "submitting"} />
      </Form>
    </div>
  );
}
