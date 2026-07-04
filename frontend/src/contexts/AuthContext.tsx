import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { MeResponse } from "@/types/api";
import api from "@/lib/axios";

interface AuthContextType {
  user: MeResponse | null;
  isLoading: boolean;
  login: (token: string, user: MeResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isHrOrAdmin: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get<MeResponse>("/auth/me");
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user session", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = (token: string, userData: MeResponse) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        isHrOrAdmin: user?.actor_type === "hr_officer",
        isEmployee: user?.actor_type === "employee",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
