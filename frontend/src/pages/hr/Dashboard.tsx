import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarCheck, ClipboardCheck, DollarSign, AlertCircle, CheckCircle2, Clock, Plus, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import api from "@/lib/axios";

// API Response Types
type RecentActivity = {
  id: string;
  message: string;
  type: string;
  time: string;
};

type DepartmentStat = {
  dept: string;
  count: number;
  present: number;
};

type HrDashboardData = {
  total_employees: number;
  employees_added_this_month: number;
  present_today: number;
  attendance_rate: number;
  pending_leaves: number;
  monthly_payroll: number;
  payroll_change_percent: number;
  recent_activities: RecentActivity[];
  department_stats: DepartmentStat[];
};

type PendingLeave = {
  id: string;
  employee_name: string;
  department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
};

export default function HrDashboard() {
  const [dashboard, setDashboard] = useState<HrDashboardData | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, leavesRes] = await Promise.all([
          api.get("/dashboard/hr"),
          api.get("/leave-requests?status=Pending&limit=5"),
        ]);
        setDashboard(dashRes.data);
        setPendingLeaves(leavesRes.data);
      } catch (error) {
        console.error("Failed to load HR dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading || !dashboard) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "leave_approved": return { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" };
      case "new_employee": return { icon: Users, color: "text-primary bg-primary/10" };
      case "absent": return { icon: AlertCircle, color: "text-destructive bg-destructive/10" };
      case "payroll": return { icon: DollarSign, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30" };
      case "check_in": return { icon: Clock, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" };
      default: return { icon: Clock, color: "text-muted-foreground bg-muted" };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening across the organization today.</p>
        </div>
        <Link to="/hr/employees">
          <Button className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={dashboard.total_employees.toString()}
          caption={`+${dashboard.employees_added_this_month} this month`}
          icon={Users}
          trend={dashboard.employees_added_this_month > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Present Today"
          value={dashboard.present_today.toString()}
          caption={`${dashboard.attendance_rate.toFixed(1)}% attendance rate`}
          icon={CalendarCheck}
          trend="up"
        />
        <StatCard
          title="Pending Leaves"
          value={dashboard.pending_leaves.toString()}
          caption="Awaiting your action"
          icon={ClipboardCheck}
          trend="neutral"
        />
        <StatCard
          title="Monthly Payroll"
          value={`₹${(dashboard.monthly_payroll / 100000).toFixed(1)}L`}
          caption={`${dashboard.payroll_change_percent >= 0 ? '+' : ''}${dashboard.payroll_change_percent.toFixed(1)}% from last month`}
          icon={DollarSign}
          trend={dashboard.payroll_change_percent > 0 ? "up" : dashboard.payroll_change_percent < 0 ? "down" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leave Approvals */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle>Pending Leave Approvals</CardTitle>
              <Link to="/hr/leave-approvals" className="text-sm font-semibold text-primary hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">EMPLOYEE</TableHead>
                    <TableHead className="font-semibold">TYPE</TableHead>
                    <TableHead className="font-semibold">DATES</TableHead>
                    <TableHead className="font-semibold text-right">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{leave.employee_name}</span>
                          <span className="text-xs text-muted-foreground">{leave.department || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{leave.leave_type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(leave.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {leave.start_date !== leave.end_date && ` - ${new Date(leave.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to="/hr/leave-approvals">
                          <Button size="sm" variant="outline" className="text-xs h-8">
                            Review
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingLeaves.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-sm text-muted-foreground">
                        No pending leave requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle>Recent Activity</CardTitle>
              <Badge variant="secondary" className="font-normal">{dashboard.recent_activities.length} new</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {dashboard.recent_activities.map((activity) => {
                  const { icon: Icon, color } = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className={`mt-0.5 p-2 rounded-full shrink-0 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 border-b border-border pb-4 last:border-0 last:pb-0">
                        <p className="text-sm font-medium text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
                {dashboard.recent_activities.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No recent activity.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Department Overview */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Department Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {dashboard.department_stats.map((d) => (
              <div
                key={d.dept}
                className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{d.dept}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{d.count}</p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  {d.present} present today
                </p>
              </div>
            ))}
            {dashboard.department_stats.length === 0 && (
              <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                No department data available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
