"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/leads");
  }

  return (
    <main className="container-app py-16">
      <form action={onSubmit} className="mx-auto max-w-md space-y-3 rounded border bg-white p-5">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input className="w-full rounded border p-2" type="email" name="email" placeholder="Email" required />
        <input className="w-full rounded border p-2" type="password" name="password" placeholder="Password" required />
        <button className="w-full rounded bg-brand px-4 py-2 text-white" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
