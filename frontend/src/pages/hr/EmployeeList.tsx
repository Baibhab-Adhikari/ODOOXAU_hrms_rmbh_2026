import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Loader2, AlertCircle, UserPlus } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

// Employee API Response type
type Employee = {
  id: string;
  employee_code: string;
  email: string;
  full_name: string;
  phone: string | null;
  department: string | null;
  job_title: string | null;
  date_of_joining: string;
  profile_picture_url: string | null;
  is_active: boolean;
  today_status: string | null;
};

const departments = ["All", "Engineering", "Design", "Marketing", "Finance", "Sales", "HR", "Operations", "Legal"];

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/employees?limit=500");
        setEmployees(res.data);
      } catch (error) {
        console.error("Failed to load employees", error);
        setErrorMsg("Failed to load employee directory.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage all employee records</p>
        </div>
        <Link to="/hr/employees/new">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : errorMsg ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {errorMsg}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={emp.profile_picture_url || ""} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium uppercase">
                            {emp.full_name.substring(0,2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{emp.full_name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{emp.employee_code}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{emp.department || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.job_title || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(emp.date_of_joining).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={emp.is_active ? "Active" : "Inactive"} />
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
