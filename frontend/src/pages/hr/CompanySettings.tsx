import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Save, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";

const companySettingsSchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  logo_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;

export default function CompanySettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/company-settings");
        reset({
          company_name: res.data.company_name,
          logo_url: res.data.logo_url || "",
        });
      } catch (error) {
        setErrorMsg("Failed to load company settings.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: CompanySettingsFormData) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.patch("/company-settings", {
        company_name: data.company_name,
        logo_url: data.logo_url || null,
      });
      setSuccessMsg("Company settings updated successfully!");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Failed to update company settings.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Company Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your organization's brand identity and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Brand Identity
          </CardTitle>
          <CardDescription>Update your company name and logo across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-md bg-emerald-50 text-emerald-600 text-sm font-medium border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                {...register("company_name")}
                placeholder="e.g. Acme Corp"
              />
              {errors.company_name && (
                <p className="text-xs text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL (Optional)</Label>
              <div className="flex gap-4">
                <Input
                  id="logo_url"
                  {...register("logo_url")}
                  placeholder="https://example.com/logo.png"
                  className="flex-1"
                />
                <Button type="button" variant="outline" className="shrink-0 gap-2">
                  <Upload className="h-4 w-4" />
                  Browse
                </Button>
              </div>
              {errors.logo_url && (
                <p className="text-xs text-destructive">{errors.logo_url.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
