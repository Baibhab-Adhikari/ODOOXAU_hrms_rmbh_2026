import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, XCircle, MessageSquare, Loader2, AlertCircle } from "lucide-react";
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
import api from "@/lib/axios";

type LeaveRequestWithEmployee = LeaveRequest & { employeeName: string };

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState<LeaveRequestWithEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
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

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const [leavesRes, employeesRes] = await Promise.all([
        api.get("/leave-requests?limit=500"),
        api.get("/employees?limit=500")
      ]);
      const employeeMap = new Map(employeesRes.data.map((emp: any) => [emp.id, emp.full_name]));
      const mappedLeaves = leavesRes.data.map((l: any) => ({
        id: l.id,
        employeeId: l.employee_id,
        employeeName: employeeMap.get(l.employee_id) || "Unknown Employee",
        leaveType: l.leave_type,
        startDate: l.start_date,
        endDate: l.end_date,
        remarks: l.remarks,
        status: l.status,
        adminComment: l.admin_comment,
        createdAt: l.created_at,
      }));
      setLeaves(mappedLeaves);
    } catch (error) {
      console.error("Failed to load leaves", error);
      setErrorMsg("Failed to load leave requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const openCommentDialog = (leaveId: string, action: "approve" | "reject") => {
    setCommentDialog({ open: true, leaveId, action });
    reset();
  };

  const onSubmitComment = async (data: LeaveCommentFormData) => {
    setIsUpdating(true);
    try {
      const action = commentDialog.action;
      const res = await api.patch(`/leave-requests/${commentDialog.leaveId}/${action}`, {
        admin_comment: data.comment,
      });
      
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === commentDialog.leaveId
            ? {
                ...l,
                status: res.data.status,
                adminComment: res.data.admin_comment,
              }
            : l
        )
      );
      setCommentDialog({ open: false, leaveId: "", action: "approve" });
    } catch (error: any) {
      console.error("Failed to process leave request", error);
      alert(error.response?.data?.detail || "Failed to process request");
    } finally {
      setIsUpdating(false);
    }
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
                  <MessageSquare className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[150px]" title={leave.adminComment}>{leave.adminComment}</span>
                </span>
              ) : (
                <span className="text-caption text-on-surface-variant">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
              No leave requests found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div>
            <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and manage leave requests</p>
      </div>

      <div className="p-6 space-y-6">
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {!isLoading && pendingLeaves.length > 0 && (
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
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : errorMsg ? (
                  <div className="text-center py-8 text-destructive">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    {errorMsg}
                  </div>
                ) : pendingLeaves.length === 0 ? (
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
                disabled={isUpdating}
                className={commentDialog.action === "reject" ? "bg-error hover:bg-error/90" : ""}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : commentDialog.action === "approve" ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {commentDialog.action === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
