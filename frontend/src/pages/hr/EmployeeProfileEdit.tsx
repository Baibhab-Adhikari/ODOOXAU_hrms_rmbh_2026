import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { hrProfileEditSchema, type HrProfileEditFormData } from "@/schemas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function EmployeeProfileEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HrProfileEditFormData>({
    resolver: zodResolver(hrProfileEditSchema),
    defaultValues: {
      fullName: "Rahul Sharma",
      email: "rahul.sharma@company.com",
      phone: "+91 98765 43210",
      address: "42, Park Avenue, Kolkata, West Bengal 700019",
      jobTitle: "Senior Software Engineer",
      department: "Engineering",
      employeeCode: "EMP-001",
    },
  });

  const onSubmit = (_data: HrProfileEditFormData) => {
    navigate(`/hr/employees/${id}`);
  };

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
                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
                      RS
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
                      <Label htmlFor="employeeCode">Employee Code</Label>
                      <Input id="employeeCode" {...register("employeeCode")} />
                      {errors.employeeCode && <p className="text-caption text-error">{errors.employeeCode.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" {...register("fullName")} />
                      {errors.fullName && <p className="text-caption text-error">{errors.fullName.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-caption text-error">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register("phone")} />
                    {errors.phone && <p className="text-caption text-error">{errors.phone.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input id="jobTitle" {...register("jobTitle")} />
                      {errors.jobTitle && <p className="text-caption text-error">{errors.jobTitle.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" {...register("department")} />
                      {errors.department && <p className="text-caption text-error">{errors.department.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" {...register("address")} />
                    {errors.address && <p className="text-caption text-error">{errors.address.message}</p>}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(`/hr/employees/${id}`)}>
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
