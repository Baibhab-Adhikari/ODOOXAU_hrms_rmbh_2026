import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { signInSchema, type SignInFormData } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    // Mock authentication — accept any valid form submission
    // Simulate an error for specific test email
    if (data.email === "wrong@example.com") {
      setLoginError("Invalid email or password. Please try again.");
      return;
    }

    setLoginError(null);
    onLogin(data.role);
    navigate(data.role === "employee" ? "/employee/dashboard" : "/hr/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary-container mb-4">
            <Building2 className="h-7 w-7 text-on-primary" />
          </div>
          <h1 className="text-headline-lg text-on-surface">Welcome Back</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Sign in to access your HRMS dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-error-container text-on-error-container text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email Address</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@company.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-caption text-error">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-caption text-error">{errors.password.message}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label>Sign in as</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(val) => setValue("role", val as "employee" | "hr")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="hr">HR Officer / Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-caption text-error">{errors.role.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full mt-6">
                Sign In
              </Button>
            </form>

            <p className="text-center text-body-md text-on-surface-variant mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
