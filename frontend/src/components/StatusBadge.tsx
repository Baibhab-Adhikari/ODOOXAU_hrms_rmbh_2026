import { Badge } from "@/components/ui/badge";

type StatusType =
  | "Present"
  | "Absent"
  | "Half-day"
  | "Leave"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Active"
  | "Inactive";

const statusConfig: Record<StatusType, { variant: "success" | "error" | "warning" | "info" | "secondary" | "outline"; label?: string }> = {
  Present: { variant: "success" },
  Active: { variant: "success" },
  Approved: { variant: "success" },
  Absent: { variant: "error" },
  Rejected: { variant: "error" },
  Inactive: { variant: "error" },
  "Half-day": { variant: "warning" },
  Pending: { variant: "warning" },
  Leave: { variant: "info" },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label || status}
    </Badge>
  );
}
