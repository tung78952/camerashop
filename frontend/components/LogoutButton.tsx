// Logout button (calls the logout Server Action).

"use client";

import { useRouter } from "next/navigation";

import { logoutAction } from "@/lib/actions";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.push("/");
  }

  return (
    <button type="button" onClick={handleLogout} className="h-11 px-3 text-sm font-medium text-muted hover:text-accent">
      Đăng xuất
    </button>
  );
}
