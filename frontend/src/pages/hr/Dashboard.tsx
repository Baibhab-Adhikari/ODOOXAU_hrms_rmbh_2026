import { Link } from "react-router-dom";
import { Users, CalendarCheck, ClipboardCheck, DollarSign, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Topbar } from "@/components/Topbar";
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
  { id: "1", icon: CheckCircle2, message: "Approved Anita Patel's sick leave for Jun 28", time: "1 hour ago", color: "text-success" },
  { id: "2", icon: Users, message: "New employee Neha Gupta onboarded", time: "3 hours ago", color: "text-primary" },
  { id: "3", icon: AlertCircle, message: "3 employees marked absent today", time: "5 hours ago", color: "text-error" },
  { id: "4", icon: DollarSign, message: "July payroll processing initiated", time: "1 day ago", color: "text-info" },
  { id: "5", icon: Clock, message: "Vikram Singh's leave request pending review", time: "2 days ago", color: "text-warning" },
];

export default function HrDashboard() {
  return (
    <div>
      <Topbar title="HR Dashboard" subtitle="Organization overview" role="hr" onLogout={() => {}} />

      <div className="p-6 space-y-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Leave Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Leave Approvals</span>
                <Link to="/hr/leave-approvals">
                  <Button variant="ghost" size="sm" className="text-primary">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>EMPLOYEE</TableHead>
                    <TableHead>TYPE</TableHead>
                    <TableHead>DATES</TableHead>
                    <TableHead>ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-on-surface">{leave.name}</p>
                          <p className="text-caption text-on-surface-variant">{leave.department}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{leave.type}</Badge>
                      </TableCell>
                      <TableCell className="text-on-surface-variant">{leave.dates}</TableCell>
                      <TableCell>
                        <Link to="/hr/leave-approvals">
                          <Button size="sm" variant="outline" className="text-xs">
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

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Activity</span>
                <Badge variant="secondary">{recentActivities.length} updates</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container-low/50 transition-colors"
                  >
                    <div className={`mt-0.5 ${activity.color}`}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-md text-on-surface">{activity.message}</p>
                      <p className="text-caption text-on-surface-variant mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  className="p-4 rounded-lg border border-outline-variant/30 hover:border-primary/30 transition-colors"
                >
                  <p className="text-title-md text-on-surface">{d.dept}</p>
                  <p className="text-headline-md text-primary mt-1">{d.count}</p>
                  <p className="text-caption text-on-surface-variant">
                    {d.present} present today
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
