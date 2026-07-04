import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import type { UserRole } from "@/types";

interface DashboardLayoutProps {
  role: UserRole;
  onLogout: () => void;
}

export function DashboardLayout({ role, onLogout }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar role={role} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <Topbar role={role} onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
