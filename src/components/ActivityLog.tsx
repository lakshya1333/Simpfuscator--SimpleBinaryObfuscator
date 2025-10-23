import { motion } from "framer-motion";
import { FileCode, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItem {
  id: string;
  fileName: string;
  status: "completed" | "processing";
  timestamp: string;
  size: string;
  obfuscationLevel: number;
}

const activityData: ActivityItem[] = [
  {
    id: "1",
    fileName: "application.exe",
    status: "completed",
    timestamp: "2 hours ago",
    size: "2.4 MB",
    obfuscationLevel: 87,
  },
  {
    id: "2",
    fileName: "library.dll",
    status: "completed",
    timestamp: "5 hours ago",
    size: "1.8 MB",
    obfuscationLevel: 92,
  },
  {
    id: "3",
    fileName: "helper.exe",
    status: "processing",
    timestamp: "Just now",
    size: "3.2 MB",
    obfuscationLevel: 45,
  },
  {
    id: "4",
    fileName: "core.dll",
    status: "completed",
    timestamp: "1 day ago",
    size: "4.1 MB",
    obfuscationLevel: 78,
  },
];

const ActivityLog = () => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/50"
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.status === "completed"
                      ? "bg-secondary/20 text-secondary"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  <FileCode className="h-5 w-5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground truncate">
                    {item.fileName}
                  </h4>
                  {item.status === "completed" && (
                    <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                  )}
                  {item.status === "processing" && (
                    <Clock className="h-4 w-4 text-primary animate-pulse flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{item.size}</span>
                  <span>•</span>
                  <span>{item.timestamp}</span>
                  <span>•</span>
                  <span className="text-primary font-medium">
                    {item.obfuscationLevel}% obfuscated
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="text-right">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      item.status === "completed"
                        ? "bg-secondary/20 text-secondary"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
