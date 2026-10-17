// Registration form.

"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import TextField from "@/components/TextField";
import { registerAction } from "@/lib/actions";

export default function RegisterForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirm") ?? "")) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await registerAction(String(form.get("name") ?? ""), String(form.get("email") ?? ""), password);
    if (result.ok) {
      router.push(next);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
      <TextField label="Họ tên" name="name" autoComplete="name" />
      <TextField label="Email" name="email" type="email" autoComplete="email" placeholder="ban@email.com" />
      <TextField label="Mật khẩu (ít nhất 6 ký tự)" name="password" type="password" autoComplete="new-password" />
      <TextField label="Nhập lại mật khẩu" name="confirm" type="password" autoComplete="new-password" />

      <button type="submit" disabled={loading}
        className="flex h-12.5 items-center justify-center gap-2.5 rounded-lg bg-accent text-[15px] font-semibold text-white hover:bg-accent-hover disabled:opacity-70">
        {loading && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
        {loading ? "Đang tạo tài khoản…" : "Đăng ký"}
      </button>

      {error && <p role="alert" className="-mt-1.5 text-[13px] text-red-700">{error}</p>}
    </form>
  );
}
