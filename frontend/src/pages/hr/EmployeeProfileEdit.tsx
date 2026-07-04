import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { hrProfileEditSchema, type HrProfileEditFormData } from "@/schemas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/axios";

export default function EmployeeProfileEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [employee, setEmployee] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HrProfileEditFormData>({
    resolver: zodResolver(hrProfileEditSchema),
  });

  useEffect(() => {
    if (!id) return;
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        setEmployee(res.data);
        reset({
          fullName: res.data.full_name,
          email: res.data.email,
          phone: res.data.phone || "",
          address: res.data.address || "",
          jobTitle: res.data.job_title || "",
          department: res.data.department || "",
        });
      } catch (error) {
        console.error("Error fetching employee", error);
        setErrorMsg("Failed to load employee details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployee();
  }, [id, reset]);

  const onSubmit = async (data: HrProfileEditFormData) => {
    setIsSaving(true);
    try {
      await api.patch(`/employees/${id}`, {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        job_title: data.jobTitle,
        department: data.department,
      });
      navigate(`/hr/employees/${id}`);
    } catch (error) {
      console.error("Failed to update employee", error);
      setErrorMsg("Failed to update employee. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (errorMsg && !employee) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/15 text-destructive text-sm font-medium max-w-2xl">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
            <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Employee</h1>
        <p className="text-muted-foreground mt-1">Update employee information</p>
      </div>

      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(`/hr/employees/${id}`)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Edit Employee Profile</CardTitle>
              <CardDescription>
                As HR Admin, you can edit all employee fields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={employee?.profile_picture_url || ""} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold uppercase">
                      {employee?.full_name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline" size="sm">Change Photo</Button>
                    <p className="text-caption text-on-surface-variant mt-1">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeCode">Employee Code (Read-Only)</Label>
                      <Input id="employeeCode" value={employee?.employee_code || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" {...register("fullName")} />
                      {errors.fullName && <p className="text-caption text-destructive">{errors.fullName.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-caption text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register("phone")} />
                    {errors.phone && <p className="text-caption text-destructive">{errors.phone.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input id="jobTitle" {...register("jobTitle")} />
                      {errors.jobTitle && <p className="text-caption text-destructive">{errors.jobTitle.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" {...register("department")} />
                      {errors.department && <p className="text-caption text-destructive">{errors.department.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" {...register("address")} />
                    {errors.address && <p className="text-caption text-destructive">{errors.address.message}</p>}
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(`/hr/employees/${id}`)} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
