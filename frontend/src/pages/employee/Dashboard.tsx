import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, CalendarCheck, CalendarDays, Clock, AlertCircle, Building2, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";


const recentActivities: any[] = [];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [dashRes, profileRes] = await Promise.all([
          api.get("/dashboard/employee"),
          api.get(`/employees/${user.id}`),
        ]);
        setDashboardData(dashRes.data);
        setProfileData(profileRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Good Morning, {user?.full_name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening today.</p>
        </div>
        <Button variant="outline" className="shrink-0 bg-background" asChild>
          <Link to="/employee/leave">Request Leave</Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Shift"
          value={dashboardData?.today_shift || "09:00 - 17:00"}
          caption={dashboardData?.clock_in_time ? `Clocked in ${dashboardData.clock_in_time}` : "Not clocked in yet"}
          icon={Clock}
        />
        <StatCard
          title="Annual Leave"
          value={dashboardData?.annual_leave_remaining?.toString() || "0"}
          caption="Days remaining"
          icon={CalendarCheck}
        />
        <StatCard
          title="Sick Leave"
          value={dashboardData?.sick_leave_remaining?.toString() || "0"}
          caption="Days remaining"
          icon={AlertCircle}
        />
        <StatCard
          title="Next Holiday"
          value={dashboardData?.next_holiday_name || "None upcoming"}
          caption={dashboardData?.next_holiday_date || "No dates"}
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
                {recentActivities.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No recent activity.
                  </div>
                )}
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
              <h3 className="text-lg font-bold text-foreground">{user?.full_name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{profileData?.job_title || "Employee"}</p>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">FULL TIME</Badge>
              
              <div className="w-full space-y-3 mt-8 text-left">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Building2 className="h-4 w-4" /> Department</span>
                  <span className="font-medium text-foreground">{profileData?.department || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Employee ID</span>
                  <span className="font-medium text-foreground">{profileData?.employee_code || "-"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border p-4">
              <Button variant="ghost" className="w-full text-primary hover:text-primary/80" asChild>
                <Link to="/employee/profile">View Full Profile</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
