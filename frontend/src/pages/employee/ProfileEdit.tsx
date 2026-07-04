import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

const profileEditSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  profile_picture_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
  });

  const watchProfilePic = watch("profile_picture_url");

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/employees/${user.id}`);
        setEmployee(res.data);
        reset({
          phone: res.data.phone || "",
          address: res.data.address || "",
          profile_picture_url: res.data.profile_picture_url || "",
        });
      } catch (error) {
        console.error("Failed to load employee profile", error);
        setErrorMsg("Failed to load your profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployee();
  }, [user, reset]);

  const onSubmit = async (data: ProfileEditFormData) => {
    if (!user) return;
    setErrorMsg(null);
    try {
      await api.patch(`/employees/${user.id}`, {
        phone: data.phone || null,
        address: data.address || null,
        profile_picture_url: data.profile_picture_url || null,
      });
      navigate("/employee/profile");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Failed to update profile.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!employee) {
    return <div>Failed to load profile.</div>;
  }

  return (
    <div>
            <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Profile</h1>
      </div>

      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/employee/profile")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Edit Your Profile</CardTitle>
              <CardDescription>
                You can update your phone number, address, and profile picture. Other fields are managed by HR.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 mb-6 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={watchProfilePic || employee.profile_picture_url || ""} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold uppercase">
                      {employee.full_name?.substring(0, 2) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-sm space-y-2">
                    <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
                    <Input
                      id="profile_picture_url"
                      placeholder="https://example.com/photo.jpg"
                      {...register("profile_picture_url")}
                    />
                    {errors.profile_picture_url && (
                      <p className="text-xs text-destructive">{errors.profile_picture_url.message}</p>
                    )}
                  </div>
                </div>

                {/* Read-only fields */}
                <div className="space-y-4 opacity-60">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={employee.full_name} disabled />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Employee Code</Label>
                      <Input value={employee.employee_code} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={employee.email} disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input value={employee.job_title} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input value={employee.department} disabled />
                    </div>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">EDITABLE FIELDS</p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+91 XXXXX XXXXX"
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your full address"
                        {...register("address")}
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive">{errors.address.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/employee/profile")} disabled={isSubmitting}>
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
