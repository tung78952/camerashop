// Admin layout: "Admin" title with the Orders / Products switch.

import { getSession } from "@/lib/session";

import AdminTabs from "./AdminTabs";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession();
  return (
    <>
      {session?.role === "ADMIN" && (
        <div className="mx-auto flex w-full max-w-300 flex-wrap items-end justify-between gap-4 px-4 pt-6 md:px-6 md:pt-8">
          <h1 className="text-2xl font-bold tracking-tight md:text-[28px]">Quản trị</h1>
          <AdminTabs />
        </div>
      )}
      {children}
    </>
  );
}
