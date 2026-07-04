import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, Calendar, FileText, Building2, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import api from "@/lib/axios";


type SalaryStructure = {
  id: string;
  basic_pay: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  effective_from: string;
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="h-5 w-5 text-on-surface-variant mt-0.5 shrink-0" />
      <div>
        <p className="text-label-md text-on-surface-variant">{label}</p>
        <p className="text-body-md text-on-surface mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function EmployeeProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [salary, setSalary] = useState<SalaryStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [empRes, docRes, salRes] = await Promise.allSettled([
          api.get(`/employees/${id}`),
          api.get(`/documents/${id}`),
          api.get(`/salary-structures/${id}`)
        ]);

        if (empRes.status === "fulfilled") {
          setEmployee(empRes.value.data);
        } else {
          setErrorMsg("Failed to load employee profile.");
        }

        if (docRes.status === "fulfilled") {
          setDocuments(docRes.value.data);
        }
        
        if (salRes.status === "fulfilled") {
          setSalary(salRes.value.data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (errorMsg || !employee) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/15 text-destructive text-sm font-medium max-w-2xl">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg || "Employee not found."}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
            <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Employee Profile</h1>
      </div>

      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/hr/employees")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={employee.profile_picture_url || ""} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold uppercase">
                  {employee.full_name.substring(0,2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-headline-md text-on-surface">{employee.full_name}</h2>
                    <p className="text-body-lg text-on-surface-variant">{employee.job_title || "No Title"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default">{employee.department || "N/A"}</Badge>
                      <Badge variant="outline">{employee.employee_code}</Badge>
                      <StatusBadge status={employee.is_active ? "Active" : "Inactive"} />
                    </div>
                  </div>
                  <Link to={`/hr/employees/${employee.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <Card>
            <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-outline-variant/30">
                <InfoRow icon={Mail} label="EMAIL" value={employee.email} />
                <InfoRow icon={Phone} label="PHONE" value={employee.phone || "Not provided"} />
                <InfoRow icon={MapPin} label="ADDRESS" value={employee.address || "Not provided"} />
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-outline-variant/30">
                <InfoRow icon={Briefcase} label="JOB TITLE" value={employee.job_title || "Not provided"} />
                <InfoRow icon={Building2} label="DEPARTMENT" value={employee.department || "Not provided"} />
                <InfoRow
                  icon={Calendar}
                  label="DATE OF JOINING"
                  value={new Date(employee.date_of_joining).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Salary Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Salary Structure</span>
                <Link to="/hr/payroll">
                  <Button variant="ghost" size="sm" className="text-primary">Edit in Payroll</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salary ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-body-md text-on-surface-variant">Basic Pay</span>
                    <span className="text-body-md text-on-surface font-medium">₹{salary.basic_pay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-body-md text-on-surface-variant">Allowances</span>
                    <span className="text-body-md text-success font-medium">+ ₹{salary.allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-body-md text-on-surface-variant">Deductions</span>
                    <span className="text-body-md text-error font-medium">- ₹{salary.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2 bg-surface-container-low rounded-lg px-3 -mx-3">
                    <span className="text-title-md text-on-surface">Net Pay</span>
                    <span className="text-title-lg text-primary font-bold">₹{salary.net_pay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No salary structure defined for this employee.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-body-md text-on-surface font-medium">{doc.doc_type}</p>
                        <p className="text-caption text-on-surface-variant">
                          Uploaded {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">View</a>
                    </Button>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No documents uploaded.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
