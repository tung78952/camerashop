// Admin page guard for the UI (the backend enforces the real ADMIN check).

import { redirect } from "next/navigation";

import StatusPage from "@/components/StatusPage";
import { getSession } from "@/lib/session";

export async function requireAdmin(nextPath: string): Promise<boolean> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${nextPath}`);
  }
  return session.role === "ADMIN";
}

export function Forbidden() {
  return <StatusPage code="403" title="Không có quyền" message="Trang này chỉ dành cho quản trị viên." />;
}
