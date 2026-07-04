import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import type { UserRole } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  role: UserRole;
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar role={role} onLogout={logout} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <Topbar role={role} onLogout={logout} />
        <main className="flex-1 p-6 overflow-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
