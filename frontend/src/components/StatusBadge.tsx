import { Badge } from "@/components/ui/badge";

type StatusType =
  | "Present" | "Absent" | "Half-day" | "Leave"
  | "Pending" | "Approved" | "Rejected"
  | "Active" | "Inactive"
  | "present" | "absent" | "half-day" | "leave" | "on_leave"
  | "pending" | "approved" | "rejected";

const statusConfig: Record<string, { variant: "success" | "error" | "warning" | "info" | "secondary" | "outline"; label?: string }> = {
  Present: { variant: "success" }, present: { variant: "success" },
  Active: { variant: "success" },
  Approved: { variant: "success" }, approved: { variant: "success" },
  Absent: { variant: "error" }, absent: { variant: "error" },
  Rejected: { variant: "error" }, rejected: { variant: "error" },
  Inactive: { variant: "error" },
  "Half-day": { variant: "warning" }, "half-day": { variant: "warning" },
  Pending: { variant: "warning" }, pending: { variant: "warning" },
  Leave: { variant: "info" }, leave: { variant: "info" }, on_leave: { variant: "info", label: "On Leave" },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label || (typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : status)}
    </Badge>
  );
}
