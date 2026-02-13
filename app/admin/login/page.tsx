"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="w-full rounded bg-brand px-4 py-2 text-white" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>;
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, { error: "" });

  return (
    <main className="container-app py-16">
      <form action={formAction} className="mx-auto max-w-md space-y-3 rounded border bg-white p-5">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input className="w-full rounded border p-2" type="email" name="email" placeholder="Email" required />
        <input className="w-full rounded border p-2" type="password" name="password" placeholder="Password" required />
        <SubmitButton />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
    </main>
  );
}
