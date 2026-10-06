"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Họ tên" name="name" type="text" autoComplete="name" />
      <Input label="Email" name="email" type="email" autoComplete="email" />
      <Input label="Mật khẩu (ít nhất 6 ký tự)" name="password" type="password" autoComplete="new-password" />
      <Input label="Nhập lại mật khẩu" name="confirm" type="password" autoComplete="new-password" />

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full rounded bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
        {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
      </button>
    </form>
  );
}

function Input({ label, name, type, autoComplete }: { label: string; name: string; type: string; autoComplete: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input name={name} type={type} required autoComplete={autoComplete}
        className="w-full rounded border px-3 py-2 outline-none focus:border-red-600" />
    </label>
  );
}
