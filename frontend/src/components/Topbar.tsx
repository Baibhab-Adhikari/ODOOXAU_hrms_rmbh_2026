import { Bell, Search, HelpCircle, Moon, Sun } from "lucide-react";
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
import { useTheme } from "@/components/ThemeProvider";

interface TopbarProps {
  role: UserRole;
  onLogout: () => void;
}

export function Topbar({ role, onLogout }: TopbarProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const userName = role === "employee" ? "Alex Johnson" : "Sarah Jenkins";
  const userTitle = role === "employee" ? "Product Designer" : "HR Manager";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-6 shadow-sm">
      <div className="flex-1" />
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={role === "hr" ? "Search employees, documents..." : "Search..."}
            className="h-9 w-full bg-muted/50 pl-9 pr-4 text-sm focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          </button>

          {/* Help */}
          <button className="relative p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors hidden sm:block">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="h-8 w-px bg-border mx-1" />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 outline-none cursor-pointer rounded-full hover:opacity-80 transition-opacity">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {userName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start md:flex">
              <span className="text-sm font-semibold leading-none text-foreground mb-1">{userName}</span>
              <span className="text-xs leading-none text-muted-foreground">{userTitle}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userTitle}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(role === "employee" ? "/employee/profile" : "/hr/dashboard")} className="cursor-pointer">
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { onLogout(); navigate("/signin"); }} className="text-destructive focus:bg-destructive/10 cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
