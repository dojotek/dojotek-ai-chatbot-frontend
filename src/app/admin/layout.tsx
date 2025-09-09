import { AdminLayout as AdminLayoutComponent } from "@/components/layout/AdminLayout";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}

export default AdminLayout;
