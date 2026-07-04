import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

// Attendance schema
type AttendanceRecord = {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
};

const statusColorMap: Record<string, string> = {
  Present: "bg-success text-white",
  Absent: "bg-error text-white",
  "Half-day": "bg-warning text-white",
  Leave: "bg-info text-white",
};

export default function AttendanceRecords() {
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("All Employees");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/attendance?limit=500");
        setAllAttendance(res.data);
      } catch (error) {
        console.error("Failed to load attendance", error);
        setErrorMsg("Failed to load attendance records.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const employees = useMemo(() => {
    const names = new Set(allAttendance.map(a => a.employee_name).filter(Boolean));
    return ["All Employees", ...Array.from(names)];
  }, [allAttendance]);

  const filteredRecords = allAttendance.filter((a) => {
    const matchesSearch = (a.employee_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEmployee = selectedEmployee === "All Employees" || a.employee_name === selectedEmployee;
    return matchesSearch && matchesEmployee;
  });

  const presentCount = allAttendance.filter((a) => a.status === "Present").length;
  const absentCount = allAttendance.filter((a) => a.status === "Absent").length;
  const halfDayCount = allAttendance.filter((a) => a.status === "Half-day").length;
  const leaveCount = allAttendance.filter((a) => a.status === "Leave").length;

  return (
    <div>
            <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Records</h1>
        <p className="text-muted-foreground mt-1">View and manage employee attendance</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-label-md text-on-surface-variant">PRESENT</p>
            <p className="text-headline-md text-success mt-1">{presentCount}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-label-md text-on-surface-variant">ABSENT</p>
            <p className="text-headline-md text-error mt-1">{absentCount}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-label-md text-on-surface-variant">HALF-DAY</p>
            <p className="text-headline-md text-warning mt-1">{halfDayCount}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-label-md text-on-surface-variant">ON LEAVE</p>
            <p className="text-headline-md text-info mt-1">{leaveCount}</p>
          </CardContent></Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <Input
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Today's Attendance — {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                  <Badge variant="secondary">{filteredRecords.length} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>EMPLOYEE</TableHead>
                      <TableHead>CHECK-IN</TableHead>
                      <TableHead>CHECK-OUT</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : errorMsg ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-destructive">
                          <div className="flex items-center justify-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            {errorMsg}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary uppercase">
                                {(record.employee_name || "NA").substring(0,2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{record.employee_name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{record.check_in ? record.check_in.substring(0, 5) : "—"}</TableCell>
                        <TableCell>{record.check_out ? record.check_out.substring(0, 5) : "—"}</TableCell>
                        <TableCell><StatusBadge status={record.status as any} /></TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && !errorMsg && filteredRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No attendance records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  className="w-full"
                  renderDay={(date) => {
                    const dayNum = date.getDate();
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const rand = (dayNum * 7) % 10;
                    let status: string | null = null;
                    if (!isWeekend && date <= new Date()) {
                      if (rand < 7) status = "Present";
                      else if (rand < 8) status = "Absent";
                      else if (rand < 9) status = "Half-day";
                      else status = "Leave";
                    }
                    return (
                      <div
                        className={cn(
                          "h-10 w-full rounded-md flex items-center justify-center text-sm font-medium",
                          status ? statusColorMap[status] : isWeekend ? "text-on-surface-variant/40" : "text-on-surface"
                        )}
                      >
                        {dayNum}
                      </div>
                    );
                  }}
                />
                <div className="flex items-center gap-4 mt-4 justify-center">
                  {Object.entries(statusColorMap).map(([label, color]) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={cn("h-3 w-3 rounded-full", color)} />
                      <span className="text-caption text-on-surface-variant">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
