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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
      <div className="rounded-lg border bg-white p-6">
        <h1 className="mb-6 text-2xl font-bold">Tạo tài khoản</h1>
        <RegisterForm next={next} />
        <p className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-red-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
