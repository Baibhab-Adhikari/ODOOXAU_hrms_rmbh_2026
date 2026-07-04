import { Link } from "react-router-dom";
import { User, CalendarCheck, CalendarDays, Clock, AlertCircle, CheckCircle2, Building2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const recentActivities = [
  {
    id: "1",
    icon: CheckCircle2,
    message: "Your leave request for Jul 10–12 was approved",
    time: "2 hours ago",
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    id: "2",
    icon: AlertCircle,
    message: "You were marked absent on Jun 28, 2026",
    time: "3 days ago",
    color: "text-destructive bg-destructive/10",
  },
  {
    id: "3",
    icon: Clock,
    message: "Check-in recorded at 09:15 AM today",
    time: "5 hours ago",
    color: "text-primary bg-primary/10",
  },
];

export default function EmployeeDashboard() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Good Morning, Alex!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening today.</p>
        </div>
        <Button variant="outline" className="shrink-0 bg-background">
          Request Leave
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Shift"
          value="09:00"
          caption="Clocked in 8:54 AM"
          icon={Clock}
        />
        <StatCard
          title="Annual Leave"
          value="14"
          caption="Days remaining out of 21"
          icon={CalendarCheck}
        />
        <StatCard
          title="Sick Leave"
          value="5"
          caption="Days remaining out of 10"
          icon={AlertCircle}
        />
        <StatCard
          title="Next Holiday"
          value="Thanksgiving"
          caption="Nov 28 - Nov 29 (2 days)"
          icon={CalendarDays}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link to="#" className="text-sm font-semibold text-primary hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`mt-0.5 p-2 rounded-full ${activity.color}`}>
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

        {/* My Profile Quick Summary */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center pb-8">
              <div className="h-24 w-24 rounded-full bg-primary/10 mb-4 flex items-center justify-center overflow-hidden">
                {/* Fallback avatar */}
                <User className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Alex Johnson</h3>
              <p className="text-sm text-muted-foreground mb-4">Product Designer</p>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">FULL TIME</Badge>
              
              <div className="w-full space-y-3 mt-8 text-left">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Building2 className="h-4 w-4" /> Department</span>
                  <span className="font-medium text-foreground">Design</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Employee ID</span>
                  <span className="font-medium text-foreground">EMP-8492</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border p-4">
              <Button variant="ghost" className="w-full text-primary hover:text-primary/80">View Full Profile</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
