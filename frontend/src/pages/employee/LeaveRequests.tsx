import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, CalendarDays, Loader2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

// Leave balances API structure
type LeaveBalance = {
  id: string;
  leave_type: string;
  allocated_days: number;
  used_days: number;
  remaining_days: number;
};

// Leave request API structure
type LeaveRequest = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  remarks: string | null;
  status: string;
  created_at: string;
};

const leaveApplicationSchema = z.object({
  leaveType: z.enum(["Paid", "Sick", "Unpaid"], { error_map: () => ({ message: "Please select a leave type" }) } as any),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  remarks: z.string().optional(),
}).refine(data => {
  return new Date(data.startDate) <= new Date(data.endDate);
}, {
  message: "End date cannot be before start date",
  path: ["endDate"]
});

type LeaveApplicationFormData = z.infer<typeof leaveApplicationSchema>;

export default function LeaveRequests() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeaveApplicationFormData>({
    resolver: zodResolver(leaveApplicationSchema),
  });

  const fetchData = async () => {
    try {
      const [leavesRes, balancesRes] = await Promise.all([
        api.get("/leave-requests/me"),
        api.get("/leave-balances/me"),
      ]);
      setLeaves(leavesRes.data);
      setBalances(balancesRes.data);
    } catch (error) {
      console.error("Failed to load leave data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: LeaveApplicationFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await api.post("/leave-requests", {
        leave_type: data.leaveType,
        start_date: data.startDate,
        end_date: data.endDate,
        remarks: data.remarks || null,
      });
      setDialogOpen(false);
      reset();
      fetchData(); // Refresh the list after successful submit
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getBalance = (type: string) => {
    return balances.find(b => b.leave_type === type);
  };

  const paidBalance = getBalance("Paid");
  const sickBalance = getBalance("Sick");
  const unpaidBalance = getBalance("Unpaid");

  return (
    <div>
            <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Requests</h1>
        <p className="text-muted-foreground mt-1">Apply for leave and track status</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Leave Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-md text-on-surface-variant">PAID LEAVE</p>
                  <p className="text-headline-md text-on-surface mt-1">{paidBalance?.remaining_days ?? 0}</p>
                  <p className="text-caption text-on-surface-variant">of {paidBalance?.allocated_days ?? 0} remaining</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <CalendarDays className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-md text-on-surface-variant">SICK LEAVE</p>
                  <p className="text-headline-md text-on-surface mt-1">{sickBalance?.remaining_days ?? 0}</p>
                  <p className="text-caption text-on-surface-variant">of {sickBalance?.allocated_days ?? 0} remaining</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <CalendarDays className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-md text-on-surface-variant">UNPAID LEAVE</p>
                  <p className="text-headline-md text-on-surface mt-1">{unpaidBalance?.used_days ?? 0}</p>
                  <p className="text-caption text-on-surface-variant">taken this year</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <CalendarDays className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>My Leave Requests</span>
              <Button onClick={() => setDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Apply for Leave
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TYPE</TableHead>
                  <TableHead>FROM</TableHead>
                  <TableHead>TO</TableHead>
                  <TableHead>REMARKS</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>APPLIED ON</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.leave_type}</TableCell>
                    <TableCell>
                      {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell>
                      {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {leave.remarks || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={leave.status as any} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(leave.created_at).toLocaleDateString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
                {leaves.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No leave requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Apply for Leave Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>Fill in the details for your leave request</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select onValueChange={(val) => setValue("leaveType", val as "Paid" | "Sick" | "Unpaid")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid Leave</SelectItem>
                  <SelectItem value="Sick">Sick Leave</SelectItem>
                  <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
              {errors.leaveType && (
                <p className="text-caption text-error">{errors.leaveType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-caption text-error">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" {...register("endDate")} />
                {errors.endDate && (
                  <p className="text-caption text-error">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Reason for leave..."
                {...register("remarks")}
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Submit Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
