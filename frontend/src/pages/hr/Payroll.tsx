import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, DollarSign } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { salaryEditSchema } from "@/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/StatCard";
import type { SalaryStructure } from "@/types";

interface PayrollEntry extends SalaryStructure {
  employeeId: string;
  employeeName: string;
  department: string;
}

const initialPayroll: PayrollEntry[] = [
  { employeeId: "emp-001", employeeName: "Rahul Sharma", department: "Engineering", basicPay: 65000, allowances: 22000, deductions: 8500, netPay: 78500, effectiveFrom: "2026-01-01" },
  { employeeId: "emp-002", employeeName: "Anita Patel", department: "Design", basicPay: 55000, allowances: 18000, deductions: 7200, netPay: 65800, effectiveFrom: "2026-01-01" },
  { employeeId: "emp-003", employeeName: "Vikram Singh", department: "Marketing", basicPay: 72000, allowances: 25000, deductions: 9800, netPay: 87200, effectiveFrom: "2026-01-01" },
  { employeeId: "emp-004", employeeName: "Sneha Reddy", department: "Engineering", basicPay: 48000, allowances: 15000, deductions: 6200, netPay: 56800, effectiveFrom: "2026-04-01" },
  { employeeId: "emp-005", employeeName: "Arjun Mehta", department: "Engineering", basicPay: 58000, allowances: 19000, deductions: 7500, netPay: 69500, effectiveFrom: "2026-01-01" },
  { employeeId: "emp-006", employeeName: "Kavita Nair", department: "Finance", basicPay: 52000, allowances: 17000, deductions: 6800, netPay: 62200, effectiveFrom: "2026-01-01" },
  { employeeId: "emp-007", employeeName: "Rohan Das", department: "Sales", basicPay: 45000, allowances: 20000, deductions: 6000, netPay: 59000, effectiveFrom: "2026-01-01" },
  { employeeId: "emp-008", employeeName: "Neha Gupta", department: "HR", basicPay: 42000, allowances: 14000, deductions: 5500, netPay: 50500, effectiveFrom: "2026-07-01" },
  { employeeId: "emp-009", employeeName: "Amit Joshi", department: "Engineering", basicPay: 62000, allowances: 21000, deductions: 8200, netPay: 74800, effectiveFrom: "2026-01-01" },
  { employeeId: "emp-010", employeeName: "Priya Kapoor", department: "Marketing", basicPay: 46000, allowances: 15500, deductions: 6100, netPay: 55400, effectiveFrom: "2026-08-01" },
];

export default function Payroll() {
  const [payroll, setPayroll] = useState(initialPayroll);
  const [editDialog, setEditDialog] = useState<{ open: boolean; employeeId: string }>({ open: false, employeeId: "" });

  const editingEmployee = payroll.find((p) => p.employeeId === editDialog.employeeId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(salaryEditSchema),
  });

  const basicPay = watch("basicPay");
  const allowances = watch("allowances");
  const deductions = watch("deductions");
  const computedNetPay = (Number(basicPay) || 0) + (Number(allowances) || 0) - (Number(deductions) || 0);

  const openEditDialog = (employeeId: string) => {
    const emp = payroll.find((p) => p.employeeId === employeeId);
    if (emp) {
      reset({
        basicPay: emp.basicPay,
        allowances: emp.allowances,
        deductions: emp.deductions,
        effectiveFrom: emp.effectiveFrom,
      });
      setEditDialog({ open: true, employeeId });
    }
  };

  const onSubmit = (data: any) => {
    const netPay = data.basicPay + data.allowances - data.deductions;
    setPayroll((prev) =>
      prev.map((p) =>
        p.employeeId === editDialog.employeeId
          ? { ...p, basicPay: data.basicPay, allowances: data.allowances, deductions: data.deductions, netPay, effectiveFrom: data.effectiveFrom }
          : p
      )
    );
    setEditDialog({ open: false, employeeId: "" });
  };

  const totalPayroll = payroll.reduce((acc, p) => acc + p.netPay, 0);
  const avgSalary = Math.round(totalPayroll / payroll.length);

  return (
    <div>
      <Topbar title="Payroll" subtitle="Manage employee compensation" role="hr" onLogout={() => {}} />

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Monthly Payroll"
            value={`₹${(totalPayroll / 100000).toFixed(1)}L`}
            caption={`${payroll.length} employees`}
            icon={DollarSign}
            trend="neutral"
          />
          <StatCard
            title="Average Salary"
            value={`₹${avgSalary.toLocaleString()}`}
            caption="Per employee"
            icon={DollarSign}
            trend="neutral"
          />
          <StatCard
            title="Highest Net Pay"
            value={`₹${Math.max(...payroll.map((p) => p.netPay)).toLocaleString()}`}
            caption="Vikram Singh"
            icon={DollarSign}
            trend="up"
          />
        </div>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Employee Payroll</span>
              <Badge variant="secondary">{payroll.length} employees</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EMPLOYEE</TableHead>
                  <TableHead>DEPARTMENT</TableHead>
                  <TableHead className="text-right">BASIC PAY</TableHead>
                  <TableHead className="text-right">ALLOWANCES</TableHead>
                  <TableHead className="text-right">DEDUCTIONS</TableHead>
                  <TableHead className="text-right">NET PAY</TableHead>
                  <TableHead>EFFECTIVE</TableHead>
                  <TableHead className="text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((entry) => (
                  <TableRow key={entry.employeeId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {entry.employeeName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-on-surface-variant">{entry.department}</TableCell>
                    <TableCell className="text-right">₹{entry.basicPay.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-success">+ ₹{entry.allowances.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-error">- ₹{entry.deductions.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">₹{entry.netPay.toLocaleString()}</TableCell>
                    <TableCell className="text-on-surface-variant">
                      {new Date(entry.effectiveFrom).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        onClick={() => openEditDialog(entry.employeeId)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Salary Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Salary — {editingEmployee?.employeeName}</DialogTitle>
            <DialogDescription>Update the salary structure for this employee</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basicPay">Basic Pay (₹)</Label>
                <Input id="basicPay" type="number" {...register("basicPay")} />
                {errors.basicPay && <p className="text-caption text-error">{errors.basicPay.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowances">Allowances (₹)</Label>
                <Input id="allowances" type="number" {...register("allowances")} />
                {errors.allowances && <p className="text-caption text-error">{errors.allowances.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deductions">Deductions (₹)</Label>
                <Input id="deductions" type="number" {...register("deductions")} />
                {errors.deductions && <p className="text-caption text-error">{errors.deductions.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective From</Label>
                <Input id="effectiveFrom" type="date" {...register("effectiveFrom")} />
                {errors.effectiveFrom && <p className="text-caption text-error">{errors.effectiveFrom.message}</p>}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-container-low">
              <div className="flex justify-between items-center">
                <span className="text-title-md text-on-surface">Computed Net Pay</span>
                <span className="text-title-lg text-primary font-bold">
                  ₹{computedNetPay.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditDialog({ ...editDialog, open: false })}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
