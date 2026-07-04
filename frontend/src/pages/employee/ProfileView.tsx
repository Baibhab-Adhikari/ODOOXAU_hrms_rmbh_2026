import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit, Mail, Phone, MapPin, Briefcase, Calendar, FileText, Building2, Loader2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}



export default function ProfileView() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [salary, setSalary] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [empRes, salRes, docRes] = await Promise.allSettled([
          api.get(`/employees/${user.id}`),
          api.get(`/salary-structures/me`),
          api.get(`/documents/me`),
        ]);
        
        if (empRes.status === "fulfilled") setEmployee(empRes.value.data);
        if (salRes.status === "fulfilled") setSalary(salRes.value.data);
        if (docRes.status === "fulfilled") setDocuments(docRes.value.data);
        
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">View and manage your personal information.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={employee.profile_picture_url || ""} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold uppercase">
                  {employee.full_name?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{employee.full_name}</h2>
                    <p className="text-lg text-muted-foreground">{employee.job_title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default">{employee.department}</Badge>
                      <Badge variant="outline">{employee.employee_code}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/employee/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <InfoRow icon={Mail} label="EMAIL" value={employee.email} />
                <InfoRow icon={Phone} label="PHONE" value={employee.phone} />
                <InfoRow icon={MapPin} label="ADDRESS" value={employee.address} />
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <InfoRow icon={Briefcase} label="JOB TITLE" value={employee.job_title} />
                <InfoRow icon={Building2} label="DEPARTMENT" value={employee.department} />
                <InfoRow
                  icon={Calendar}
                  label="DATE OF JOINING"
                  value={employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "—"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Salary Structure (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Salary Structure</span>
                <Badge variant="outline">Read Only</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salary ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Basic Pay</span>
                    <span className="text-sm font-medium">₹{salary.basic_pay?.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Allowances</span>
                    <span className="text-sm text-emerald-600 font-medium">+ ₹{salary.allowances?.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Deductions</span>
                    <span className="text-sm text-destructive font-medium">- ₹{salary.deductions?.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2 bg-muted/50 rounded-lg px-3 -mx-3">
                    <span className="text-base font-semibold">Net Pay</span>
                    <span className="text-lg text-primary font-bold">₹{salary.net_pay?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Effective from {new Date(salary.effective_from).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No salary structure has been defined for your account yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.doc_type}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" /> View
                        </a>
                      </Button>
                    </div>
                  ))}
                  {documents.length > 5 && (
                    <div className="pt-2">
                      <Button variant="link" className="w-full" asChild>
                        <Link to="/employee/documents">View all documents</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No documents found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
