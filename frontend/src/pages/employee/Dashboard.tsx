import { Link } from "react-router-dom";
import { User, CalendarCheck, CalendarDays, Clock, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentActivities = [
  {
    id: "1",
    icon: CheckCircle2,
    message: "Your leave request for Jul 10–12 was approved",
    time: "2 hours ago",
    color: "text-success",
  },
  {
    id: "2",
    icon: AlertCircle,
    message: "You were marked absent on Jun 28, 2026",
    time: "3 days ago",
    color: "text-error",
  },
  {
    id: "3",
    icon: Clock,
    message: "Check-in recorded at 09:15 AM today",
    time: "5 hours ago",
    color: "text-primary",
  },
  {
    id: "4",
    icon: TrendingUp,
    message: "Your June salary slip is now available",
    time: "1 week ago",
    color: "text-info",
  },
  {
    id: "5",
    icon: CalendarDays,
    message: "Leave request for Jul 20–21 is pending review",
    time: "1 week ago",
    color: "text-warning",
  },
];

const quickAccessCards = [
  {
    to: "/employee/profile",
    icon: User,
    title: "My Profile",
    description: "View and update your personal details",
    color: "bg-primary/10 text-primary",
  },
  {
    to: "/employee/attendance",
    icon: CalendarCheck,
    title: "Attendance",
    description: "Check in/out and view your records",
    color: "bg-success/10 text-success",
  },
  {
    to: "/employee/leave",
    icon: CalendarDays,
    title: "Leave Requests",
    description: "Apply for leave or track existing requests",
    color: "bg-warning/10 text-warning",
  },
  {
    to: "/employee/salary",
    icon: TrendingUp,
    title: "Salary",
    description: "View your salary structure and payslips",
    color: "bg-info/10 text-info",
  },
];

export default function EmployeeDashboard() {
  return (
    <div>
      <Topbar title="Dashboard" subtitle="Welcome back, Rahul!" role="employee" onLogout={() => {}} />

      <div className="p-6 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Days Present"
            value="22"
            caption="+2 from last month"
            icon={CalendarCheck}
            trend="up"
          />
          <StatCard
            title="Leave Balance"
            value="14"
            caption="Paid: 8 | Sick: 4 | Unpaid: 2"
            icon={CalendarDays}
            trend="neutral"
          />
          <StatCard
            title="Pending Requests"
            value="1"
            caption="Awaiting HR approval"
            icon={Clock}
            trend="neutral"
          />
          <StatCard
            title="This Month"
            value="96%"
            caption="Attendance rate"
            icon={TrendingUp}
            trend="up"
          />
        </div>

        {/* Quick Access */}
        <div>
          <h2 className="text-title-lg text-on-surface mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccessCards.map((card) => (
              <Link key={card.to} to={card.to}>
                <Card className="hover:border-primary/30 hover:shadow-[0px_8px_16px_rgba(0,0,0,0.06)] transition-all group cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-lg ${card.color} mb-4 group-hover:scale-110 transition-transform`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-title-md text-on-surface mb-1">{card.title}</h3>
                    <p className="text-caption text-on-surface-variant">{card.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

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
    </div>
  );
}
