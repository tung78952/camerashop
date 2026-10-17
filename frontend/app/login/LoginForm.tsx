// Login form; on success redirects to the requested page.

"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import TextField from "@/components/TextField";
import { loginAction } from "@/lib/actions";

export default function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    const result = await loginAction(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
    if (result.ok) {
      router.push(next);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
      <TextField label="Email" name="email" type="email" autoComplete="email" placeholder="ban@email.com" />
      <TextField label="Mật khẩu" name="password" type="password" autoComplete="current-password" />

      <button type="submit" disabled={loading}
        className="flex h-12.5 items-center justify-center gap-2.5 rounded-lg bg-accent text-[15px] font-semibold text-white hover:bg-accent-hover disabled:opacity-70">
        {loading && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
        {loading ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>

      {error && <p role="alert" className="-mt-1.5 text-[13px] text-red-700">{error}</p>}
    </form>
  );
}
