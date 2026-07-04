import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, Calendar, FileText, Building2 } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import type { Employee, Document as DocType, SalaryStructure } from "@/types";

const employeeData: Record<string, Employee> = {
  "emp-001": { id: "emp-001", employeeCode: "EMP-001", email: "rahul.sharma@company.com", fullName: "Rahul Sharma", phone: "+91 98765 43210", address: "42, Park Avenue, Kolkata, West Bengal 700019", jobTitle: "Senior Software Engineer", department: "Engineering", dateOfJoining: "2023-03-15" },
  "emp-002": { id: "emp-002", employeeCode: "EMP-002", email: "anita.patel@company.com", fullName: "Anita Patel", phone: "+91 98765 43211", address: "15, Marine Drive, Mumbai, MH 400001", jobTitle: "UI/UX Designer", department: "Design", dateOfJoining: "2023-06-01" },
};

const mockDocuments: DocType[] = [
  { id: "doc-1", docType: "Resume", fileUrl: "#", uploadedAt: "2023-03-15" },
  { id: "doc-2", docType: "ID Proof (Aadhaar)", fileUrl: "#", uploadedAt: "2023-03-15" },
  { id: "doc-3", docType: "PAN Card", fileUrl: "#", uploadedAt: "2023-03-16" },
  { id: "doc-4", docType: "Offer Letter", fileUrl: "#", uploadedAt: "2023-03-15" },
];

const mockSalary: SalaryStructure = {
  basicPay: 65000,
  allowances: 22000,
  deductions: 8500,
  netPay: 78500,
  effectiveFrom: "2026-01-01",
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
  const employee = employeeData[id || "emp-001"] || employeeData["emp-001"];

  return (
    <div>
      <Topbar title="Employee Profile" subtitle={employee.fullName} role="hr" onLogout={() => {}} />

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
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                  {employee.fullName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-headline-md text-on-surface">{employee.fullName}</h2>
                    <p className="text-body-lg text-on-surface-variant">{employee.jobTitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default">{employee.department}</Badge>
                      <Badge variant="outline">{employee.employeeCode}</Badge>
                      <StatusBadge status="Active" />
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
                <InfoRow icon={Phone} label="PHONE" value={employee.phone} />
                <InfoRow icon={MapPin} label="ADDRESS" value={employee.address} />
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-outline-variant/30">
                <InfoRow icon={Briefcase} label="JOB TITLE" value={employee.jobTitle} />
                <InfoRow icon={Building2} label="DEPARTMENT" value={employee.department} />
                <InfoRow
                  icon={Calendar}
                  label="DATE OF JOINING"
                  value={new Date(employee.dateOfJoining).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
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
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-body-md text-on-surface-variant">Basic Pay</span>
                  <span className="text-body-md text-on-surface font-medium">₹{mockSalary.basicPay.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2">
                  <span className="text-body-md text-on-surface-variant">Allowances</span>
                  <span className="text-body-md text-success font-medium">+ ₹{mockSalary.allowances.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2">
                  <span className="text-body-md text-on-surface-variant">Deductions</span>
                  <span className="text-body-md text-error font-medium">- ₹{mockSalary.deductions.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2 bg-surface-container-low rounded-lg px-3 -mx-3">
                  <span className="text-title-md text-on-surface">Net Pay</span>
                  <span className="text-title-lg text-primary font-bold">₹{mockSalary.netPay.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-body-md text-on-surface font-medium">{doc.docType}</p>
                        <p className="text-caption text-on-surface-variant">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
