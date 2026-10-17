// Admin layout: "Admin" title with the Orders / Products switch.

import { getSession } from "@/lib/session";

import AdminTabs from "./AdminTabs";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession();
  return (
    <>
      {session?.role === "ADMIN" && <AdminTabs />}
      {children}
    </>
  );
}
