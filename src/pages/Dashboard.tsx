import { motion } from "framer-motion";
import { Activity, Shield, Zap } from "lucide-react";
import MetricsCard from "@/components/MetricsCard";
import ActivityLog from "@/components/ActivityLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your binary obfuscation operations
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricsCard
          title="Total Obfuscations"
          value="127"
          icon={<Activity className="h-5 w-5" />}
          trend="+23 this week"
          color="blue"
        />
        <MetricsCard
          title="Protection Level"
          value="Advanced"
          icon={<Shield className="h-5 w-5" />}
          trend="Military-grade encryption"
          color="green"
        />
        <MetricsCard
          title="Processing Speed"
          value="2.4s"
          icon={<Zap className="h-5 w-5" />}
          trend="Average per file"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Files Processed Today</span>
                <span className="font-bold text-primary">12</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Average Obfuscation</span>
                <span className="font-bold text-secondary">84%</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Total Data Secured</span>
                <span className="font-bold">156.8 GB</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-bold text-secondary">99.2%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CPU Usage</span>
                  <span className="text-primary font-medium">34%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-[34%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Memory Usage</span>
                  <span className="text-secondary font-medium">58%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary to-primary w-[58%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium">23.4 GB / 100 GB</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-[23%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <ActivityLog />
    </div>
  );
};

export default Dashboard;
