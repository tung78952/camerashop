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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
      <div className="rounded-lg border bg-white p-6">
        <h1 className="mb-6 text-2xl font-bold">Đăng nhập</h1>
        <LoginForm next={next} />
        <p className="mt-4 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-red-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-dashed bg-white p-4 text-sm text-gray-600">
        <p className="mb-1 font-semibold">Tài khoản dùng thử</p>
        <p>Khách: <code>demo@camerashop.local</code> / <code>demo123</code></p>
        <p>Quản trị: <code>admin@camerashop.local</code> / <code>admin123</code></p>
      </div>
    </main>
  );
}
