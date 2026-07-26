import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/session";

// Guard tier PRD Bagian 11.1 — kalau belum login, tendang ke /admin/login.
export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <AdminSidebar session={session} />
      <main className="flex-1 p-4 sm:p-6 min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}
