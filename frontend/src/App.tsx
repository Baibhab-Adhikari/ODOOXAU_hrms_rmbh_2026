import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { UserRole } from "@/types";

// Layouts
import { DashboardLayout } from "@/components/DashboardLayout";

// Auth Pages
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";

// Employee Pages
import EmployeeDashboard from "@/pages/employee/Dashboard";
import ProfileView from "@/pages/employee/ProfileView";
import ProfileEdit from "@/pages/employee/ProfileEdit";
import EmployeeAttendance from "@/pages/employee/Attendance";
import LeaveRequests from "@/pages/employee/LeaveRequests";
import Salary from "@/pages/employee/Salary";

// HR Pages
import HrDashboard from "@/pages/hr/Dashboard";
import EmployeeList from "@/pages/hr/EmployeeList";
import EmployeeProfileView from "@/pages/hr/EmployeeProfileView";
import EmployeeProfileEdit from "@/pages/hr/EmployeeProfileEdit";
import AttendanceRecords from "@/pages/hr/AttendanceRecords";
import LeaveApprovals from "@/pages/hr/LeaveApprovals";
import Payroll from "@/pages/hr/Payroll";

function App() {
  const [role, setRole] = useState<UserRole | null>(null);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  const handleLogout = () => {
    setRole(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/signin"
          element={<SignIn onLogin={handleLogin} />}
        />

        {/* Employee routes */}
        <Route
          path="/employee"
          element={
            role === "employee" ? (
              <DashboardLayout role="employee" onLogout={handleLogout} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        >
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="profile/edit" element={<ProfileEdit />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="leave" element={<LeaveRequests />} />
          <Route path="salary" element={<Salary />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* HR routes */}
        <Route
          path="/hr"
          element={
            role === "hr" ? (
              <DashboardLayout role="hr" onLogout={handleLogout} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        >
          <Route path="dashboard" element={<HrDashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/:id" element={<EmployeeProfileView />} />
          <Route path="employees/:id/edit" element={<EmployeeProfileEdit />} />
          <Route path="attendance" element={<AttendanceRecords />} />
          <Route path="leave-approvals" element={<LeaveApprovals />} />
          <Route path="payroll" element={<Payroll />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
