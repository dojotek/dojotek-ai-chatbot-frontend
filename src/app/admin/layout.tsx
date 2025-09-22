import { AdminLayout as AdminLayoutComponent } from "@/components/layout/AdminLayout";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side check (in addition to middleware) to prevent rendering without auth
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/sign-in");

  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}

export default AdminLayout;
