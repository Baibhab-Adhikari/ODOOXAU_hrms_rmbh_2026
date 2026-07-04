import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { salaryEditSchema, type SalaryEditFormData } from "@/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/StatCard";
import api from "@/lib/axios";

interface PayrollEntry {
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  profilePicUrl?: string;
  salaryId?: string;
  basicPay: number;
  allowances: number;
  deductions: number;
  netPay: number;
  effectiveFrom?: string;
  wage: number; // Stored wage
}

export default function Payroll() {
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editDialog, setEditDialog] = useState<{ open: boolean; employeeId: string }>({ open: false, employeeId: "" });

  const editingEmployee = payroll.find((p) => p.employeeId === editDialog.employeeId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SalaryEditFormData>({
    resolver: zodResolver(salaryEditSchema as any) as any,
  });

  const watchWage = watch("wage");

  const fetchPayroll = async () => {
    setIsLoading(true);
    try {
      const [empRes, salRes] = await Promise.all([
        api.get("/employees?limit=500"),
        api.get("/salary-structures?limit=500"),
      ]);

      const salaries = new Map();
      salRes.data.forEach((s: any) => {
        salaries.set(s.employee_id, s);
      });

      const merged: PayrollEntry[] = empRes.data.map((emp: any) => {
        const sal = salaries.get(emp.id);
        return {
          employeeId: emp.id,
          employeeName: emp.full_name,
          department: emp.department || "N/A",
          jobTitle: emp.job_title || "N/A",
          profilePicUrl: emp.profile_picture_url,
          salaryId: sal?.id,
          basicPay: sal?.basic_pay || 0,
          allowances: sal?.allowances || 0,
          deductions: sal?.deductions || 0,
          netPay: sal?.net_pay || 0,
          effectiveFrom: sal?.effective_from,
          wage: sal?.salary_components?.wage || 0,
        };
      });

      setPayroll(merged);
    } catch (error) {
      console.error("Failed to load payroll", error);
      setErrorMsg("Failed to load payroll records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const openEditDialog = (employeeId: string) => {
    const emp = payroll.find((p) => p.employeeId === employeeId);
    if (emp) {
      reset({
        wage: emp.wage,
        effectiveFrom: emp.effectiveFrom || new Date().toISOString().split("T")[0],
      });
      setEditDialog({ open: true, employeeId });
    }
  };

  const onSubmit = async (data: SalaryEditFormData) => {
    setIsUpdating(true);
    try {
      const emp = payroll.find(p => p.employeeId === editDialog.employeeId);
      if (!emp) return;

      const payload = {
        effective_from: data.effectiveFrom,
        components: {
          wage: data.wage
        }
      };

      if (emp.salaryId) {
        // Update existing
        await api.patch(`/salary-structures/${emp.salaryId}`, payload);
      } else {
        // Create new
        await api.post(`/salary-structures`, { ...payload, employee_id: emp.employeeId });
      }
      
      await fetchPayroll();
      setEditDialog({ open: false, employeeId: "" });
    } catch (error: any) {
      console.error("Failed to save salary", error);
      alert(error.response?.data?.detail || "Failed to save salary structure");
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPayroll = payroll.reduce((acc, p) => acc + p.netPay, 0);
  const avgSalary = payroll.length > 0 ? Math.round(totalPayroll / payroll.length) : 0;
  const highestPaid = payroll.length > 0 ? payroll.reduce((prev, curr) => prev.netPay > curr.netPay ? prev : curr) : null;

  return (
    <div>
            <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Payroll</h1>
        <p className="text-muted-foreground mt-1">Manage employee compensation</p>
      </div>

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
            value={`₹${(highestPaid?.netPay || 0).toLocaleString()}`}
            caption={highestPaid?.employeeName || "N/A"}
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
                  <TableHead>JOB TITLE</TableHead>
                  <TableHead className="text-right">BASIC PAY</TableHead>
                  <TableHead className="text-right">ALLOWANCES</TableHead>
                  <TableHead className="text-right">DEDUCTIONS</TableHead>
                  <TableHead className="text-right">NET PAY</TableHead>
                  <TableHead>EFFECTIVE</TableHead>
                  <TableHead className="text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : errorMsg ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-destructive">
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {errorMsg}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : payroll.map((entry) => (
                  <TableRow key={entry.employeeId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.profilePicUrl} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary uppercase">
                            {entry.employeeName.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-on-surface-variant">
                      <span className="truncate max-w-[150px] inline-block">{entry.jobTitle}</span>
                    </TableCell>
                    <TableCell className="text-right">₹{entry.basicPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right text-success">+ ₹{entry.allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right text-error">- ₹{entry.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">₹{entry.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-on-surface-variant">
                      {entry.effectiveFrom ? new Date(entry.effectiveFrom).toLocaleDateString("en-IN", { month: "short", year: "numeric", day: "numeric" }) : "—"}
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
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wage">Total Wage (₹)</Label>
                <Input id="wage" type="number" step="0.01" {...register("wage")} />
                <p className="text-xs text-muted-foreground">Basic pay, allowances, etc. will be computed automatically.</p>
                {errors.wage && <p className="text-caption text-destructive">{errors.wage.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective From</Label>
                <Input id="effectiveFrom" type="date" {...register("effectiveFrom")} />
                {errors.effectiveFrom && <p className="text-caption text-destructive">{errors.effectiveFrom.message}</p>}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-container-low">
              <div className="flex justify-between items-center">
                <span className="text-title-md text-on-surface">Target Net Pay (approx)</span>
                <span className="text-title-lg text-primary font-bold">
                  ₹{Number(watchWage || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditDialog({ ...editDialog, open: false })} disabled={isUpdating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
