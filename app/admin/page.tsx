import { requireAdminSession } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin-dashboard";

export default async function AdminPage() {
  await requireAdminSession();
  return (
    <main className="container-app py-8">
      <h1 className="mb-4 text-3xl font-bold">Admin Dashboard</h1>
      <AdminDashboard />
    </main>
  );
}
