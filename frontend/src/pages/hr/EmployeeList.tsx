import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee } from "@/types";

const mockEmployees: Employee[] = [
  { id: "emp-001", employeeCode: "EMP-001", email: "rahul.sharma@company.com", fullName: "Rahul Sharma", phone: "+91 98765 43210", address: "Kolkata, WB", jobTitle: "Senior Software Engineer", department: "Engineering", dateOfJoining: "2023-03-15" },
  { id: "emp-002", employeeCode: "EMP-002", email: "anita.patel@company.com", fullName: "Anita Patel", phone: "+91 98765 43211", address: "Mumbai, MH", jobTitle: "UI/UX Designer", department: "Design", dateOfJoining: "2023-06-01" },
  { id: "emp-003", employeeCode: "EMP-003", email: "vikram.singh@company.com", fullName: "Vikram Singh", phone: "+91 98765 43212", address: "Delhi, DL", jobTitle: "Marketing Manager", department: "Marketing", dateOfJoining: "2022-09-10" },
  { id: "emp-004", employeeCode: "EMP-004", email: "sneha.reddy@company.com", fullName: "Sneha Reddy", phone: "+91 98765 43213", address: "Hyderabad, TS", jobTitle: "Data Analyst", department: "Engineering", dateOfJoining: "2024-01-20" },
  { id: "emp-005", employeeCode: "EMP-005", email: "arjun.mehta@company.com", fullName: "Arjun Mehta", phone: "+91 98765 43214", address: "Bangalore, KA", jobTitle: "Backend Developer", department: "Engineering", dateOfJoining: "2023-11-05" },
  { id: "emp-006", employeeCode: "EMP-006", email: "kavita.nair@company.com", fullName: "Kavita Nair", phone: "+91 98765 43215", address: "Chennai, TN", jobTitle: "Financial Analyst", department: "Finance", dateOfJoining: "2024-03-12" },
  { id: "emp-007", employeeCode: "EMP-007", email: "rohan.das@company.com", fullName: "Rohan Das", phone: "+91 98765 43216", address: "Pune, MH", jobTitle: "Sales Executive", department: "Sales", dateOfJoining: "2023-07-22" },
  { id: "emp-008", employeeCode: "EMP-008", email: "neha.gupta@company.com", fullName: "Neha Gupta", phone: "+91 98765 43217", address: "Jaipur, RJ", jobTitle: "HR Coordinator", department: "HR", dateOfJoining: "2026-07-01" },
  { id: "emp-009", employeeCode: "EMP-009", email: "amit.joshi@company.com", fullName: "Amit Joshi", phone: "+91 98765 43218", address: "Ahmedabad, GJ", jobTitle: "DevOps Engineer", department: "Engineering", dateOfJoining: "2023-05-18" },
  { id: "emp-010", employeeCode: "EMP-010", email: "priya.kapoor@company.com", fullName: "Priya Kapoor", phone: "+91 98765 43219", address: "Lucknow, UP", jobTitle: "Content Strategist", department: "Marketing", dateOfJoining: "2024-08-03" },
];

const departments = ["All", "Engineering", "Design", "Marketing", "Finance", "Sales", "HR", "Operations", "Legal"];

export default function EmployeeList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const filteredEmployees = mockEmployees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div>
      <Topbar title="Employees" subtitle="Manage all employee records" role="hr" onLogout={() => {}} />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <Input
                  placeholder="Search by name, code, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-on-surface-variant" />
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept === "All" ? "All Departments" : dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Employee Directory</span>
              <Badge variant="secondary">{filteredEmployees.length} employees</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EMPLOYEE</TableHead>
                  <TableHead>CODE</TableHead>
                  <TableHead>DEPARTMENT</TableHead>
                  <TableHead>JOB TITLE</TableHead>
                  <TableHead>JOINED</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                            {emp.fullName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-on-surface">{emp.fullName}</p>
                          <p className="text-caption text-on-surface-variant">{emp.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{emp.employeeCode}</Badge>
                    </TableCell>
                    <TableCell className="text-on-surface-variant">{emp.department}</TableCell>
                    <TableCell className="text-on-surface-variant">{emp.jobTitle}</TableCell>
                    <TableCell className="text-on-surface-variant">
                      {new Date(emp.dateOfJoining).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="Active" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/hr/employees/${emp.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant">
                <p className="text-body-lg">No employees found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
