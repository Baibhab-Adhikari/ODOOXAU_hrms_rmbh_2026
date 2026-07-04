import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  caption?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({ title, value, caption, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("hover:border-primary/30 transition-colors", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-title-md text-on-surface-variant">{title}</p>
            <p className="text-display-lg text-on-surface leading-none">{value}</p>
            {caption && (
              <p className={cn(
                "text-caption",
                trend === "up" && "text-success",
                trend === "down" && "text-error",
                trend === "neutral" && "text-on-surface-variant",
                !trend && "text-on-surface-variant"
              )}>
                {trend === "up" && "↑ "}
                {trend === "down" && "↓ "}
                {caption}
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
