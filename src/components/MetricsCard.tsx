import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: "blue" | "green" | "purple";
}

const MetricsCard = ({ title, value, icon, trend, color = "blue" }: MetricsCardProps) => {
  const colorClasses = {
    blue: "text-primary neon-glow",
    green: "text-secondary neon-glow-green",
    purple: "text-[hsl(var(--cyber-purple))]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-card hover:neon-glow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={colorClasses[color]}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricsCard;
