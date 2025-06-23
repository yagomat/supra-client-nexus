
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
    <Card className={`shadow-sm hover:shadow transition-all ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-md bg-muted flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold">{value}</h3>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
