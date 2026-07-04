import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  CalendarDays,
  DollarSign,
  Building2,
  Clock,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
}

const employeeNavItems = [
  { to: "/employee/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/employee/attendance", icon: CalendarCheck, label: "Attendance" },
  { to: "/employee/leave", icon: CalendarDays, label: "Leave Management" },
  { to: "/employee/salary", icon: DollarSign, label: "Payroll" },
  { to: "/employee/profile", icon: User, label: "Profile" },
];

const hrNavItems = [
  { to: "/hr/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/hr/attendance", icon: CalendarCheck, label: "Attendance" },
  { to: "/hr/leave-approvals", icon: CalendarDays, label: "Leave Management" },
  { to: "/hr/payroll", icon: DollarSign, label: "Payroll" },
  { to: "/hr/employees", icon: User, label: "Profile" },
];

export function Sidebar({ role, onLogout }: SidebarProps) {
  const navItems = role === "employee" ? employeeNavItems : hrNavItems;
  const portalName = role === "employee" ? "Employee Dashboard" : "HR Portal";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground hidden flex-col md:flex border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">{portalName}</span>
          <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Management System</span>
        </div>
      </div>

      <div className="px-4 py-4">
        <Button variant="default" className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 justify-center gap-2 shadow-sm">
          <Clock className="h-4 w-4" />
          Quick Clock-In
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="p-4 space-y-1">
        <button
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all cursor-pointer"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span>Help Center</span>
        </button>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
