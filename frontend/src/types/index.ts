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
  status: "Present" | "Absent" | "Half-day" | "Leave";
};

export type LeaveRequest = {
  id: string;
  employeeId?: string;
  employeeName: string;
  leaveType: "Paid" | "Sick" | "Unpaid";
  startDate: string;
  endDate: string;
  remarks?: string;
  status: "Pending" | "Approved" | "Rejected";
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
