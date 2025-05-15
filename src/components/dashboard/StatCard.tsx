
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  loading: boolean;
  className?: string;
}

export const StatCard = ({ title, value, icon, loading, className }: StatCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <h3 className="text-3xl font-bold">{value}</h3>
          )}
        </div>
        <div className={`p-2 rounded-full ${className}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};
