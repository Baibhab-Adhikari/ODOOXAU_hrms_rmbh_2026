import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, CalendarDays } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { leaveApplicationSchema, type LeaveApplicationFormData } from "@/schemas";
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
import type { LeaveRequest } from "@/types";

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "lr-1",
    employeeName: "Rahul Sharma",
    leaveType: "Paid",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    remarks: "Family function",
    status: "Approved",
    adminComment: "Approved. Enjoy!",
    createdAt: "2026-07-01",
  },
  {
    id: "lr-2",
    employeeName: "Rahul Sharma",
    leaveType: "Sick",
    startDate: "2026-06-15",
    endDate: "2026-06-15",
    remarks: "Not feeling well",
    status: "Approved",
    createdAt: "2026-06-14",
  },
  {
    id: "lr-3",
    employeeName: "Rahul Sharma",
    leaveType: "Paid",
    startDate: "2026-07-20",
    endDate: "2026-07-21",
    remarks: "Personal work",
    status: "Pending",
    createdAt: "2026-07-02",
  },
  {
    id: "lr-4",
    employeeName: "Rahul Sharma",
    leaveType: "Unpaid",
    startDate: "2026-05-05",
    endDate: "2026-05-07",
    remarks: "Extended vacation",
    status: "Rejected",
    adminComment: "Too many pending tasks. Please reschedule.",
    createdAt: "2026-04-28",
  },
];

export default function LeaveRequests() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaves, setLeaves] = useState(mockLeaveRequests);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeaveApplicationFormData>({
    resolver: zodResolver(leaveApplicationSchema),
  });

  const onSubmit = (data: LeaveApplicationFormData) => {
    const newLeave: LeaveRequest = {
      id: `lr-${leaves.length + 1}`,
      employeeName: "Rahul Sharma",
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      remarks: data.remarks,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLeaves([newLeave, ...leaves]);
    setDialogOpen(false);
    reset();
  };

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
                  <p className="text-headline-md text-on-surface mt-1">8</p>
                  <p className="text-caption text-on-surface-variant">of 15 remaining</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <CalendarDays className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-md text-on-surface-variant">SICK LEAVE</p>
                  <p className="text-headline-md text-on-surface mt-1">4</p>
                  <p className="text-caption text-on-surface-variant">of 7 remaining</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <CalendarDays className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-md text-on-surface-variant">UNPAID LEAVE</p>
                  <p className="text-headline-md text-on-surface mt-1">2</p>
                  <p className="text-caption text-on-surface-variant">taken this year</p>
                </div>
                <div className="p-3 rounded-lg bg-info/10">
                  <CalendarDays className="h-5 w-5 text-info" />
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
                    <TableCell className="font-medium">{leave.leaveType}</TableCell>
                    <TableCell>
                      {new Date(leave.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell>
                      {new Date(leave.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-on-surface-variant">
                      {leave.remarks || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={leave.status} />
                    </TableCell>
                    <TableCell className="text-on-surface-variant">
                      {new Date(leave.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
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

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
