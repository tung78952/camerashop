"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input name="email" type="email" required autoComplete="email"
          className="w-full rounded border px-3 py-2 outline-none focus:border-red-600" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Mật khẩu</span>
        <input name="password" type="password" required autoComplete="current-password"
          className="w-full rounded border px-3 py-2 outline-none focus:border-red-600" />
      </label>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full rounded bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
