import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
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
import { zfd } from "zod-form-data";

import FormSubmitButton from "~/components/FormSubmitButton";
import FormText from "~/components/FormText";
import PageTitle from "~/components/PageTitle";
import updateUser from "~/libs/updateUser";
import { requireUserSession } from "~/utils/auth.server";
import db from "~/utils/db.server";
import { commitSession, getSession } from "~/utils/session.server";

export const meta: MetaFunction = () => ({
  title: "Login - Waifu Trader",
});

export const validationSchema = z
  .object({
    user: z.object({
      username: z.string(),
      email: z.string(),
      password: z.string(),
    }),
    username: z
      .string()
      .min(1)
      .max(50)
      .regex(/[A-Za-z0-9_-]+/, {
        message: "Only alphanumeric characters, _, - are allowed",
      }),
    email: z.string().email(),
    currentPassword: zfd.text(z.string().nullish()),
    newPassword: zfd.text(z.string().min(8).nullish()),
    passwordConfirmation: zfd.text(z.string().min(8).nullish()),
  })
  .refine(
    async ({ username, user }) => {
      if (user.username === username) return true;

      const existingUserWithUsername = await db.user.findFirst({
        where: {
          AND: [{ username }, { NOT: { username: user.username } }],
        },
      });

      return existingUserWithUsername === null;
    },
    { message: "Username already in use", path: ["username"] },
  )
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
  const user = await requireUserSession(request);

  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const validation = await validationSchema.safeParseAsync({ ...data, user });

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors, data };
  }

  await updateUser({
    user,
    username: validation.data.username ?? undefined,
    email: validation.data.email ?? undefined,
    password: validation.data.newPassword ?? undefined,
  });

  const session = await getSession(request.headers.get("cookie"));

  session.flash("notification", {
    type: "success",
    message: "Preferences updated.",
  });

  return redirect(request.url, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

type LoaderData = {
  user: User;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserSession(request);

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
          name="username"
          label="Username"
          defaultValue={actionData?.data.username ?? user.username}
          errors={actionData?.errors.username}
          placeholder="keima_katsuragi"
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
