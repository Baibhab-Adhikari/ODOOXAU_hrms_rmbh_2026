import { Link } from "react-router-dom";
import { Users, CalendarCheck, ClipboardCheck, DollarSign, AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

const pendingLeaves = [
  { id: "1", name: "Rahul Sharma", type: "Paid", dates: "Jul 20–21", department: "Engineering" },
  { id: "2", name: "Anita Patel", type: "Sick", dates: "Jul 8", department: "Design" },
  { id: "3", name: "Vikram Singh", type: "Paid", dates: "Jul 15–18", department: "Marketing" },
];

const recentActivities = [
  { id: "1", icon: CheckCircle2, message: "Approved Anita Patel's sick leave for Jun 28", time: "1 hour ago", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
  { id: "2", icon: Users, message: "New employee Neha Gupta onboarded", time: "3 hours ago", color: "text-primary bg-primary/10" },
  { id: "3", icon: AlertCircle, message: "3 employees marked absent today", time: "5 hours ago", color: "text-destructive bg-destructive/10" },
  { id: "4", icon: DollarSign, message: "July payroll processing initiated", time: "1 day ago", color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30" },
  { id: "5", icon: Clock, message: "Vikram Singh's leave request pending review", time: "2 days ago", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
];

export default function HrDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening across the organization today.</p>
        </div>
        <Button className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value="48"
          caption="+3 this month"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Present Today"
          value="42"
          caption="87.5% attendance rate"
          icon={CalendarCheck}
          trend="up"
        />
        <StatCard
          title="Pending Leaves"
          value="3"
          caption="Awaiting your action"
          icon={ClipboardCheck}
          trend="neutral"
        />
        <StatCard
          title="Monthly Payroll"
          value="₹38.2L"
          caption="+2.1% from last month"
          icon={DollarSign}
          trend="up"
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
                          <span className="font-medium text-foreground">{leave.name}</span>
                          <span className="text-xs text-muted-foreground">{leave.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{leave.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{leave.dates}</TableCell>
                      <TableCell className="text-right">
                        <Link to="/hr/leave-approvals">
                          <Button size="sm" variant="outline" className="text-xs h-8">
                            Review
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
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
              <Badge variant="secondary" className="font-normal">{recentActivities.length} new</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`mt-0.5 p-2 rounded-full shrink-0 ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 border-b border-border pb-4 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
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
            {[
              { dept: "Engineering", count: 18, present: 16 },
              { dept: "Design", count: 8, present: 7 },
              { dept: "Marketing", count: 10, present: 8 },
              { dept: "Finance", count: 6, present: 6 },
              { dept: "HR", count: 4, present: 3 },
              { dept: "Sales", count: 12, present: 10 },
              { dept: "Operations", count: 5, present: 5 },
              { dept: "Legal", count: 3, present: 2 },
            ].map((d) => (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
