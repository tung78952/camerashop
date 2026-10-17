// Login page (redirects away if already logged in).

import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession, safeNextPath } from "@/lib/session";

import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNextPath((await searchParams).next);
  if (await getSession()) {
    redirect(next);
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-24 pt-10 md:pt-18">
      <div className="flex w-full max-w-105 flex-col gap-4.5 rounded-2xl border border-line bg-surface px-6 pb-8 pt-9 md:px-8 md:pt-10">
        <div className="mb-1 flex flex-col gap-1">
          <h1 className="text-[26px] font-bold tracking-tight">Đăng nhập</h1>
          <p className="text-sm text-muted">Chào mừng bạn quay lại TCameraShop.</p>
        </div>
        <LoginForm next={next} />
        <p className="mt-1.5 border-t border-line pt-4.5 text-center text-sm text-ink-2">
          Chưa có tài khoản?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-accent hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>

      <div className="mt-4 w-full max-w-105 rounded-xl border border-dashed border-line-strong px-5 py-4 text-sm text-ink-2">
        <p className="mb-1 font-semibold text-ink">Tài khoản dùng thử</p>
        <p>Khách: <code>demo@camerashop.local</code> / <code>demo123</code></p>
        <p>Quản trị: <code>admin@camerashop.local</code> / <code>admin123</code></p>
      </div>
    </main>
  );
}
