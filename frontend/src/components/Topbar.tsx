import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserRole } from "@/types";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  title: string;
  subtitle?: string;
  role: UserRole;
  onLogout: () => void;
}

export function Topbar({ title, subtitle, role, onLogout }: TopbarProps) {
  const navigate = useNavigate();
  const userName = role === "employee" ? "Rahul Sharma" : "Priya Desai";

  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Title */}
        <div>
          <h1 className="text-headline-md text-on-surface">{title}</h1>
          {subtitle && (
            <p className="text-caption text-on-surface-variant">{subtitle}</p>
          )}
        </div>

        {/* Right: Search + Notifications + User */}
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
            <Input
              placeholder="Search..."
              className="w-64 pl-9 h-9 bg-surface-container-low border-none"
            />
          </div>

          <button className="relative p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
            <Bell className="h-5 w-5 text-on-surface-variant" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-error rounded-full" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer focus:outline-none">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {userName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-caption text-on-surface-variant">
                  {role === "employee" ? "Employee" : "HR Admin"}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(role === "employee" ? "/employee/profile" : "/hr/dashboard")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { onLogout(); navigate("/signin"); }} className="text-error">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
