import { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, Loader2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

// Define the API response type
type AttendanceRecord = {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
};

const statusColorMap: Record<string, string> = {
  present: "bg-emerald-500 text-white",
  absent: "bg-destructive text-white",
  "half-day": "bg-amber-500 text-white",
  leave: "bg-blue-500 text-white",
  holiday: "bg-purple-500 text-white",
};

export default function EmployeeAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance/me");
      setAttendance(res.data);
    } catch (error) {
      console.error("Failed to load attendance", error);
      setErrorMsg("Failed to load attendance records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local time
  const todayRecord = attendance.find(a => a.date === todayStr);
  const isCheckedIn = !!todayRecord?.check_in;
  const isCheckedOut = !!todayRecord?.check_out;

  const handleCheckIn = async () => {
    setErrorMsg(null);
    setIsCheckingIn(true);
    try {
      await api.post("/attendance/check-in");
      await fetchAttendance();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Failed to check in.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setErrorMsg(null);
    setIsCheckingOut(true);
    try {
      await api.post("/attendance/check-out");
      await fetchAttendance();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Failed to check out.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Build map for calendar
  const attendanceMap: Record<string, string> = {};
  attendance.forEach((a) => {
    attendanceMap[a.date] = a.status.toLowerCase();
  });

  const getWeeklyDateStr = (index: number) => {
    const curr = new Date();
    const dayOfWeek = curr.getDay() || 7; 
    curr.setDate(curr.getDate() - dayOfWeek + 1 + index); 
    return curr.toLocaleDateString("en-CA");
  };

  return (
    <div>
            <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance</h1>
        <p className="text-muted-foreground mt-1">Track your daily attendance</p>
      </div>

      <div className="p-6 space-y-6">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Today's Check-in/out Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Today — {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-muted-foreground">
                      Check-in: <span className="text-foreground font-medium">{todayRecord?.check_in ? todayRecord.check_in.substring(0,5) : "—"}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Check-out: <span className="text-foreground font-medium">{todayRecord?.check_out ? todayRecord.check_out.substring(0,5) : "—"}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {isLoading ? (
                  <Button disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</Button>
                ) : !isCheckedIn ? (
                  <Button onClick={handleCheckIn} disabled={isCheckingIn}>
                    {isCheckingIn ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                    Check In
                  </Button>
                ) : !isCheckedOut ? (
                  <Button onClick={handleCheckOut} variant="outline" disabled={isCheckingOut}>
                    {isCheckingOut ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                    Check Out
                  </Button>
                ) : (
                  <StatusBadge status={(todayRecord?.status as any) || "Present"} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Views */}
        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          {/* Daily View */}
          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DATE</TableHead>
                      <TableHead>CHECK-IN</TableHead>
                      <TableHead>CHECK-OUT</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {new Date(record.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{record.check_in ? record.check_in.substring(0,5) : "—"}</TableCell>
                        <TableCell>{record.check_out ? record.check_out.substring(0,5) : "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={record.status as any} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {attendance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No attendance records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly View */}
          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-3">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                    const dateStr = getWeeklyDateStr(i);
                    const status = attendanceMap[dateStr];
                    return (
                      <div
                        key={day}
                        className="text-center p-4 rounded-lg border border-outline-variant/30 hover:border-primary/30 transition-colors"
                      >
                        <p className="text-label-md text-on-surface-variant mb-2">{day}</p>
                        {status ? (
                          <StatusBadge status={status as any} />
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  className="w-full max-w-full"
                  renderDay={(date) => {
                    const status = attendanceMap[date.toLocaleDateString("en-CA")];
                    let bgColor = "";
                    let color = "text-on-surface";
                    
                    if (status === "present") { bgColor = "bg-emerald-500"; color = "text-white"; }
                    else if (status === "absent") { bgColor = "bg-destructive"; color = "text-white"; }
                    else if (status === "half-day") { bgColor = "bg-amber-500"; color = "text-white"; }
                    else if (status === "leave") { bgColor = "bg-blue-500"; color = "text-white"; }
                    else if (status === "holiday") { bgColor = "bg-purple-500"; color = "text-white"; }
                    
                    return (
                      <div className={cn("h-10 w-full flex items-center justify-center rounded-md text-sm font-medium", bgColor, color)}>
                        {date.getDate()}
                      </div>
                    );
                  }}
                />
                <div className="flex flex-wrap items-center gap-4 mt-6 justify-center">
                  {Object.entries(statusColorMap).map(([label, color]) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={cn("h-3 w-3 rounded-full", color)} />
                      <span className="text-xs font-medium text-muted-foreground capitalize">{label.replace("-", " ")}</span>
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
