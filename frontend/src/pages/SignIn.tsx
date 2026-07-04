import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, AlertCircle, Mail, Lock } from "lucide-react";
import { signInSchema, type SignInFormData } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/types";

interface SignInProps {
  onLogin: (role: UserRole) => void;
}

export default function SignIn({ onLogin }: SignInProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = (data: SignInFormData) => {
    if (data.email === "wrong@example.com") {
      setLoginError("Invalid email or password. Please try again.");
      return;
    }

    setLoginError(null);
    onLogin(data.role);
    navigate(data.role === "employee" ? "/employee/dashboard" : "/hr/dashboard");
  };

  return (
    <div className="min-h-screen bg-background bg-dotted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary mb-5 shadow-sm">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">HR Portal</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-lg border-x-border border-b-border">
          <CardContent className="pt-6">
            {loginError && (
              <div className="flex items-center gap-2 p-3 mb-6 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="signin-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-9 h-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</Label>
                  <Link to="#" className="text-xs font-medium text-primary hover:underline">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9 h-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sign in as</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(val) => setValue("role", val as "employee" | "hr")}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="hr">HR Officer / Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-destructive mt-1">{errors.role.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">
                  Remember me for 30 days
                </label>
              </div>

              <Button type="submit" className="w-full h-10 text-base font-medium mt-2">
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary font-semibold hover:underline">
                  Contact IT Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer Links */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
