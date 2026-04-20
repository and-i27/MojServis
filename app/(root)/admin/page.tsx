import { requireAdmin } from "@/lib/requireUser";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  // Preveri če je uporabnik admin
  await requireAdmin();

  return <AdminDashboard />;
}