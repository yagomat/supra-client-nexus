
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
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-full p-6 ${className}`}>
            {icon}
          </div>
          <div className="flex flex-col p-6 pl-3 flex-1">
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
