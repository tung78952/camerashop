import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

export async function requireAdmin(nextPath: string): Promise<boolean> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${nextPath}`);
  }
  return session.role === "ADMIN";
}

export function Forbidden() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-bold">403 – Không có quyền</h1>
      <p className="text-gray-500">Trang này chỉ dành cho quản trị viên.</p>
      <Link href="/" className="text-red-600 hover:underline">Về trang chủ</Link>
    </main>
  );
}
