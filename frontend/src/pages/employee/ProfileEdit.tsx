import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { profileEditSchema, type ProfileEditFormData } from "@/schemas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfileEdit() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      phone: "+91 98765 43210",
      address: "42, Park Avenue, Kolkata, West Bengal 700019",
    },
  });

  const onSubmit = (_data: ProfileEditFormData) => {
    // Mock save — just navigate back
    navigate("/employee/profile");
  };

  return (
    <div>
      <Topbar title="Edit Profile" role="employee" onLogout={() => {}} />

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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
                      RS
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-caption text-on-surface-variant mt-1">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                {/* Read-only fields */}
                <div className="space-y-4 opacity-60">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value="Rahul Sharma" disabled />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Employee Code</Label>
                      <Input value="EMP-001" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value="rahul.sharma@company.com" disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input value="Senior Software Engineer" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input value="Engineering" disabled />
                    </div>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="pt-4 border-t border-outline-variant/30">
                  <p className="text-label-md text-primary mb-4">EDITABLE FIELDS</p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+91 XXXXX XXXXX"
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-caption text-error">{errors.phone.message}</p>
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
                        <p className="text-caption text-error">{errors.address.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/employee/profile")}>
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
