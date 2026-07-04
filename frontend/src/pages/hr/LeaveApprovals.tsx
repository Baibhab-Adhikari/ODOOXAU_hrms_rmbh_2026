import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { StatusBadge } from "@/components/StatusBadge";
import { leaveCommentSchema, type LeaveCommentFormData } from "@/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { LeaveRequest } from "@/types";

const initialLeaveRequests: LeaveRequest[] = [
  { id: "lr-1", employeeId: "emp-001", employeeName: "Rahul Sharma", leaveType: "Paid", startDate: "2026-07-20", endDate: "2026-07-21", remarks: "Personal work", status: "Pending", createdAt: "2026-07-02" },
  { id: "lr-2", employeeId: "emp-002", employeeName: "Anita Patel", leaveType: "Sick", startDate: "2026-07-08", endDate: "2026-07-08", remarks: "Doctor appointment", status: "Pending", createdAt: "2026-07-04" },
  { id: "lr-3", employeeId: "emp-003", employeeName: "Vikram Singh", leaveType: "Paid", startDate: "2026-07-15", endDate: "2026-07-18", remarks: "Family vacation", status: "Pending", createdAt: "2026-07-01" },
  { id: "lr-4", employeeId: "emp-004", employeeName: "Sneha Reddy", leaveType: "Sick", startDate: "2026-06-25", endDate: "2026-06-26", remarks: "Fever", status: "Approved", adminComment: "Get well soon!", createdAt: "2026-06-24" },
  { id: "lr-5", employeeId: "emp-005", employeeName: "Arjun Mehta", leaveType: "Paid", startDate: "2026-07-05", endDate: "2026-07-07", remarks: "Wedding in family", status: "Approved", adminComment: "Approved. Enjoy the wedding!", createdAt: "2026-06-28" },
  { id: "lr-6", employeeId: "emp-006", employeeName: "Kavita Nair", leaveType: "Unpaid", startDate: "2026-06-20", endDate: "2026-06-22", remarks: "Extended trip", status: "Rejected", adminComment: "Quarter close. Please reschedule.", createdAt: "2026-06-15" },
  { id: "lr-7", employeeId: "emp-007", employeeName: "Rohan Das", leaveType: "Paid", startDate: "2026-06-10", endDate: "2026-06-12", remarks: "Moving to new apartment", status: "Approved", createdAt: "2026-06-05" },
  { id: "lr-8", employeeId: "emp-009", employeeName: "Amit Joshi", leaveType: "Sick", startDate: "2026-07-03", endDate: "2026-07-03", remarks: "Migraine", status: "Approved", adminComment: "Take care.", createdAt: "2026-07-02" },
];

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState(initialLeaveRequests);
  const [commentDialog, setCommentDialog] = useState<{ open: boolean; leaveId: string; action: "approve" | "reject" }>({
    open: false,
    leaveId: "",
    action: "approve",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveCommentFormData>({
    resolver: zodResolver(leaveCommentSchema),
  });

  const openCommentDialog = (leaveId: string, action: "approve" | "reject") => {
    setCommentDialog({ open: true, leaveId, action });
    reset();
  };

  const onSubmitComment = (data: LeaveCommentFormData) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === commentDialog.leaveId
          ? {
              ...l,
              status: commentDialog.action === "approve" ? ("Approved" as const) : ("Rejected" as const),
              adminComment: data.comment,
            }
          : l
      )
    );
    setCommentDialog({ open: false, leaveId: "", action: "approve" });
  };

  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const processedLeaves = leaves.filter((l) => l.status !== "Pending");

  const LeaveTable = ({ data }: { data: LeaveRequest[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>EMPLOYEE</TableHead>
          <TableHead>TYPE</TableHead>
          <TableHead>FROM</TableHead>
          <TableHead>TO</TableHead>
          <TableHead>REMARKS</TableHead>
          <TableHead>STATUS</TableHead>
          <TableHead>ACTIONS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((leave) => (
          <TableRow key={leave.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {leave.employeeName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{leave.employeeName}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{leave.leaveType}</Badge>
            </TableCell>
            <TableCell className="text-on-surface-variant">
              {new Date(leave.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </TableCell>
            <TableCell className="text-on-surface-variant">
              {new Date(leave.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-on-surface-variant">
              {leave.remarks || "—"}
            </TableCell>
            <TableCell>
              <StatusBadge status={leave.status} />
            </TableCell>
            <TableCell>
              {leave.status === "Pending" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-success hover:bg-success/10"
                    onClick={() => openCommentDialog(leave.id, "approve")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-error hover:bg-error/10"
                    onClick={() => openCommentDialog(leave.id, "reject")}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : leave.adminComment ? (
                <span className="text-caption text-on-surface-variant flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {leave.adminComment}
                </span>
              ) : (
                <span className="text-caption text-on-surface-variant">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div>
      <Topbar title="Leave Approvals" subtitle="Review and manage leave requests" role="hr" onLogout={() => {}} />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {pendingLeaves.length > 0 && (
                <Badge variant="warning" className="ml-2">{pendingLeaves.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processed">Processed</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success/50" />
                    <p className="text-body-lg">All caught up! No pending requests.</p>
                  </div>
                ) : (
                  <LeaveTable data={pendingLeaves} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processed">
            <Card>
              <CardHeader><CardTitle>Processed Requests</CardTitle></CardHeader>
              <CardContent>
                <LeaveTable data={processedLeaves} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader><CardTitle>All Leave Requests</CardTitle></CardHeader>
              <CardContent>
                <LeaveTable data={leaves} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Comment Dialog */}
      <Dialog open={commentDialog.open} onOpenChange={(open) => setCommentDialog({ ...commentDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {commentDialog.action === "approve" ? "Approve" : "Reject"} Leave Request
            </DialogTitle>
            <DialogDescription>
              Add a comment for the employee about your decision.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitComment)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder={
                  commentDialog.action === "approve"
                    ? "e.g. Approved. Enjoy your time off!"
                    : "e.g. Please reschedule to next month."
                }
                {...register("comment")}
              />
              {errors.comment && <p className="text-caption text-error">{errors.comment.message}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setCommentDialog({ ...commentDialog, open: false })}>
                Cancel
              </Button>
              <Button
                type="submit"
                className={commentDialog.action === "reject" ? "bg-error hover:bg-error/90" : ""}
              >
                {commentDialog.action === "approve" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
