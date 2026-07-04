import { useState } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Attendance as AttendanceType } from "@/types";

const mockAttendance: AttendanceType[] = [
  { id: "1", date: "2026-07-04", checkIn: "09:12 AM", checkOut: undefined, status: "Present" },
  { id: "2", date: "2026-07-03", checkIn: "09:05 AM", checkOut: "06:30 PM", status: "Present" },
  { id: "3", date: "2026-07-02", checkIn: "09:20 AM", checkOut: "06:15 PM", status: "Present" },
  { id: "4", date: "2026-07-01", checkIn: undefined, checkOut: undefined, status: "Absent" },
  { id: "5", date: "2026-06-30", checkIn: "09:00 AM", checkOut: "01:00 PM", status: "Half-day" },
  { id: "6", date: "2026-06-29", checkIn: undefined, checkOut: undefined, status: "Leave" },
  { id: "7", date: "2026-06-28", checkIn: undefined, checkOut: undefined, status: "Leave" },
  { id: "8", date: "2026-06-27", checkIn: "08:55 AM", checkOut: "06:45 PM", status: "Present" },
  { id: "9", date: "2026-06-26", checkIn: "09:10 AM", checkOut: "06:20 PM", status: "Present" },
  { id: "10", date: "2026-06-25", checkIn: "09:30 AM", checkOut: "06:00 PM", status: "Present" },
];

// Build a map of dates to attendance status for calendar rendering
const attendanceMap: Record<string, AttendanceType["status"]> = {};
mockAttendance.forEach((a) => {
  attendanceMap[a.date] = a.status;
});

const statusColorMap: Record<string, string> = {
  Present: "bg-success text-white",
  Absent: "bg-error text-white",
  "Half-day": "bg-warning text-white",
  Leave: "bg-info text-white",
};

export default function EmployeeAttendance() {
  const [checkedIn, setCheckedIn] = useState(true); // Today already checked in
  const [checkOutTime, setCheckOutTime] = useState<string | undefined>(undefined);

  const handleCheckIn = () => {
    setCheckedIn(true);
  };

  const handleCheckOut = () => {
    setCheckOutTime(
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div>
      <Topbar title="Attendance" subtitle="Track your daily attendance" role="employee" onLogout={() => {}} />

      <div className="p-6 space-y-6">
        {/* Today's Check-in/out Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-title-md text-on-surface">Today — {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-body-md text-on-surface-variant">
                      Check-in: <span className="text-on-surface font-medium">{checkedIn ? "09:12 AM" : "—"}</span>
                    </span>
                    <span className="text-body-md text-on-surface-variant">
                      Check-out: <span className="text-on-surface font-medium">{checkOutTime || "—"}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {!checkedIn ? (
                  <Button onClick={handleCheckIn}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                ) : !checkOutTime ? (
                  <Button onClick={handleCheckOut} variant="outline">
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out
                  </Button>
                ) : (
                  <StatusBadge status="Present" />
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
                    {mockAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {new Date(record.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{record.checkIn || "—"}</TableCell>
                        <TableCell>{record.checkOut || "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                      </TableRow>
                    ))}
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
                    const statuses: AttendanceType["status"][] = [
                      "Present", "Present", "Present", "Absent", "Present", "Leave", "Leave",
                    ];
                    const status = statuses[i];
                    return (
                      <div
                        key={day}
                        className="text-center p-4 rounded-lg border border-outline-variant/30 hover:border-primary/30 transition-colors"
                      >
                        <p className="text-label-md text-on-surface-variant mb-2">{day}</p>
                        <StatusBadge status={status} />
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
                  className="w-full"
                  renderDay={(date) => {
                    const dateStr = date.toISOString().split("T")[0];
                    const status = attendanceMap[dateStr];
                    const dayNum = date.getDate();
                    return (
                      <div
                        className={cn(
                          "h-10 w-full rounded-md flex items-center justify-center text-sm font-medium transition-colors",
                          status ? statusColorMap[status] : "text-on-surface hover:bg-surface-container-low"
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
