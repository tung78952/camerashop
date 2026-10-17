// Registration page.

import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession, safeNextPath } from "@/lib/session";

import RegisterForm from "./RegisterForm";

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const next = safeNextPath((await searchParams).next);
  if (await getSession()) {
    redirect(next);
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-24 pt-10 md:pt-18">
      <div className="flex w-full max-w-105 flex-col gap-4.5 rounded-2xl border border-line bg-surface px-6 pb-8 pt-9 md:px-8 md:pt-10">
        <div className="mb-1 flex flex-col gap-1">
          <h1 className="text-[26px] font-bold tracking-tight">Tạo tài khoản</h1>
          <p className="text-sm text-muted">Đăng ký để đặt hàng và theo dõi đơn.</p>
        </div>
        <RegisterForm next={next} />
        <p className="mt-1.5 border-t border-line pt-4.5 text-center text-sm text-ink-2">
          Đã có tài khoản?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-accent hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
