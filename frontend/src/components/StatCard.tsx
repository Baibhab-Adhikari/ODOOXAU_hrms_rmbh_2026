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
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">{title}</p>
            <p className="text-4xl font-bold tracking-tight text-foreground">{value}</p>
            {caption && (
              <div className="flex items-center gap-1 mt-2 text-xs font-medium">
                {trend === "up" && <span className="text-emerald-600 dark:text-emerald-400">↑</span>}
                {trend === "down" && <span className="text-destructive">↓</span>}
                <span className={cn(
                  trend === "up" ? "text-emerald-600 dark:text-emerald-400" :
                  trend === "down" ? "text-destructive" :
                  "text-muted-foreground"
                )}>
                  {caption}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
