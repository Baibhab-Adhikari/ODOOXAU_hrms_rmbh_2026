import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Loader2, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";

const addEmployeeSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
});

type AddEmployeeFormData = z.infer<typeof addEmployeeSchema>;

export default function AddEmployee() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{login_id: string, temporary_password: string} | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddEmployeeFormData>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      dateOfJoining: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = async (data: AddEmployeeFormData) => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const res = await api.post(`/employees`, {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        job_title: data.jobTitle,
        department: data.department,
        date_of_joining: data.dateOfJoining,
      });
      setSuccessData({
        login_id: res.data.login_id,
        temporary_password: res.data.temporary_password,
      });
    } catch (error: any) {
      console.error("Failed to add employee", error);
      setErrorMsg(error.response?.data?.detail || "Failed to add employee. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">Employee Added Successfully</CardTitle>
            <CardDescription>
              Please share these temporary credentials with the employee securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Login ID</Label>
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md font-mono text-lg">
                  {successData.login_id}
                  <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(successData.login_id)}>
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Temporary Password</Label>
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md font-mono text-lg">
                  {successData.temporary_password}
                  <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(successData.temporary_password)}>
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-blue-700 dark:text-blue-400 mt-4">
                The employee must change their password upon their first login.
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-2 pb-6">
            <Button onClick={() => navigate("/hr/employees")} size="lg">
              Return to Directory
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Employee</h1>
        <p className="text-muted-foreground mt-1">Create a new employee record</p>
      </div>

      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/hr/employees")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>New Employee Details</CardTitle>
              <CardDescription>
                Fill out the required information to onboard a new employee.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" {...register("fullName")} />
                    {errors.fullName && <p className="text-caption text-destructive">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" {...register("department")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfJoining">Date of Joining *</Label>
                    <Input id="dateOfJoining" type="date" {...register("dateOfJoining")} />
                    {errors.dateOfJoining && <p className="text-caption text-destructive">{errors.dateOfJoining.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" {...register("address")} />
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
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Add Employee
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/hr/employees")} disabled={isSaving}>
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
