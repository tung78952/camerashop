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
    <button type="button" onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">
      Đăng xuất
    </button>
  );
}
