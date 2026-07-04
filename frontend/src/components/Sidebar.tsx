import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  CalendarDays,
  LogOut,
  Users,
  ClipboardCheck,
  DollarSign,
  Building2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
}

const employeeNavItems = [
  { to: "/employee/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/employee/profile", icon: User, label: "Profile" },
  { to: "/employee/attendance", icon: CalendarCheck, label: "Attendance" },
  { to: "/employee/leave", icon: CalendarDays, label: "Leave Requests" },
  { to: "/employee/salary", icon: DollarSign, label: "Salary" },
];

const hrNavItems = [
  { to: "/hr/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/hr/employees", icon: Users, label: "Employees" },
  { to: "/hr/attendance", icon: CalendarCheck, label: "Attendance" },
  { to: "/hr/leave-approvals", icon: ClipboardCheck, label: "Leave Approvals" },
  { to: "/hr/payroll", icon: DollarSign, label: "Payroll" },
];

export function Sidebar({ role, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const navItems = role === "employee" ? employeeNavItems : hrNavItems;
  const userName = role === "employee" ? "Rahul Sharma" : "Priya Desai";
  const userTitle = role === "employee" ? "Software Engineer" : "HR Manager";

  const handleLogout = () => {
    onLogout();
    navigate("/signin");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-inverse-surface text-inverse-on-surface flex flex-col">
      {/* Brand */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary-container flex items-center justify-center">
            <Building2 className="h-5 w-5 text-on-primary" />
          </div>
          <div>
            <h1 className="text-title-md text-inverse-on-surface">HRMS</h1>
            <p className="text-caption text-inverse-on-surface/60">Kinetic Enterprise</p>
          </div>
        </div>
      </div>

      <Separator className="bg-inverse-on-surface/10" />

      {/* User info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-inverse-on-surface/5">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary-container text-on-primary text-xs">
              {userName.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-inverse-on-surface truncate">{userName}</p>
            <p className="text-caption text-inverse-on-surface/60 truncate">{userTitle}</p>
          </div>
        </div>
      </div>

      <Separator className="bg-inverse-on-surface/10" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-label-md text-inverse-on-surface/40 px-3 mb-2">
          {role === "employee" ? "MENU" : "ADMINISTRATION"}
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary-container text-on-primary"
                  : "text-inverse-on-surface/70 hover:bg-inverse-on-surface/10 hover:text-inverse-on-surface"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Separator className="bg-inverse-on-surface/10" />

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-inverse-on-surface/70 hover:bg-error/20 hover:text-error-container transition-all cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
