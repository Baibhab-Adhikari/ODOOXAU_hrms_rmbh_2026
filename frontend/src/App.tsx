import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Layouts
import { DashboardLayout } from "@/components/DashboardLayout";
import { ThemeProvider } from "@/components/ThemeProvider";

// Auth Pages
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import ChangePassword from "@/pages/ChangePassword";

// Employee Pages
import EmployeeDashboard from "@/pages/employee/Dashboard";
import ProfileView from "@/pages/employee/ProfileView";
import ProfileEdit from "@/pages/employee/ProfileEdit";
import EmployeeAttendance from "@/pages/employee/Attendance";
import LeaveRequests from "@/pages/employee/LeaveRequests";
import Salary from "@/pages/employee/Salary";
import EmployeeDocuments from "@/pages/employee/Documents";

// HR Pages
import HrDashboard from "@/pages/hr/Dashboard";
import EmployeeList from "@/pages/hr/EmployeeList";
import AddEmployee from "@/pages/hr/AddEmployee";
import EmployeeProfileView from "@/pages/hr/EmployeeProfileView";
import EmployeeProfileEdit from "@/pages/hr/EmployeeProfileEdit";
import AttendanceRecords from "@/pages/hr/AttendanceRecords";
import LeaveApprovals from "@/pages/hr/LeaveApprovals";
import Payroll from "@/pages/hr/Payroll";
import CompanySettings from "@/pages/hr/CompanySettings";
import Documents from "@/pages/hr/Documents";

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/signin" replace />;
  if (user.actor_type === "hr_officer") return <Navigate to="/hr/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="hrms-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/change-password" element={
              <ProtectedRoute allowedRoles={["employee", "hr_officer"]}>
                <ChangePassword />
              </ProtectedRoute>
            } />

            {/* Employee routes */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <DashboardLayout role="employee" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="profile" element={<ProfileView />} />
              <Route path="profile/edit" element={<ProfileEdit />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="leave" element={<LeaveRequests />} />
              <Route path="salary" element={<Salary />} />
              <Route path="documents" element={<EmployeeDocuments />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* HR routes */}
            <Route
              path="/hr"
              element={
                <ProtectedRoute allowedRoles={["hr_officer"]}>
                  <DashboardLayout role="hr" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<HrDashboard />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="employees/new" element={<AddEmployee />} />
              <Route path="employees/:id" element={<EmployeeProfileView />} />
              <Route path="employees/:id/edit" element={<EmployeeProfileEdit />} />
              <Route path="attendance" element={<AttendanceRecords />} />
              <Route path="leave-approvals" element={<LeaveApprovals />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="company-settings" element={<CompanySettings />} />
              <Route path="documents" element={<Documents />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
