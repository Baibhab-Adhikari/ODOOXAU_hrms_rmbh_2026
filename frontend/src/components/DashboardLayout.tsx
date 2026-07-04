import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import type { UserRole } from "@/types";

interface DashboardLayoutProps {
  role: UserRole;
  onLogout: () => void;
}

export function DashboardLayout({ role, onLogout }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} onLogout={onLogout} />
      <main className="ml-64">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
