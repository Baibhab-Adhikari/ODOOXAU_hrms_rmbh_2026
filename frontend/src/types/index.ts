export type Employee = {
  id: string;
  employeeCode: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  jobTitle: string;
  department: string;
  dateOfJoining: string;
  profilePictureUrl?: string;
};

export type HrOfficer = {
  id: string;
  email: string;
  fullName: string;
};

export type Document = {
  id: string;
  docType: string;
  fileUrl: string;
  uploadedAt: string;
};

export type Attendance = {
  id: string;
  employeeId?: string;
  employeeName?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "present" | "absent" | "on_leave";
};

export type LeaveRequest = {
  id: string;
  employeeId?: string;
  employeeName: string;
  leaveType: "paid_time_off" | "sick_leave" | "unpaid_leave";
  startDate: string;
  endDate: string;
  remarks?: string;
  status: "pending" | "approved" | "rejected";
  adminComment?: string;
  createdAt: string;
};

export type SalaryStructure = {
  employeeId?: string;
  employeeName?: string;
  basicPay: number;
  allowances: number;
  deductions: number;
  netPay: number;
  effectiveFrom: string;
};

export type UserRole = "employee" | "hr";
