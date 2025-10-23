import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Shield, Zap, Play, Settings2 } from "lucide-react";
import MetricsCard from "@/components/MetricsCard";
import ActivityLog from "@/components/ActivityLog";
import UploadSection from "@/components/UploadSection";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [isObfuscating, setIsObfuscating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState({
    controlFlow: true,
    stringEncryption: true,
    antiDebug: true,
    apiHiding: false,
  });
  const { toast } = useToast();

  const startObfuscation = () => {
    if (!uploadedFile) {
      toast({
        title: "No file uploaded",
        description: "Please upload a file first",
        variant: "destructive",
      });
      return;
    }

    setIsObfuscating(true);
    setIsComplete(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsObfuscating(false);
          setIsComplete(true);
          toast({
            title: "Obfuscation complete!",
            description: "Your binary has been successfully obfuscated",
          });
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Simpfuscator Dashboard
        </h1>
        <p className="text-muted-foreground">
          Upload and obfuscate your Windows PE binaries
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UploadSection onFileUploaded={setUploadedFile} />

          {uploadedFile && !isObfuscating && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={startObfuscation}
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Obfuscation
              </Button>
            </motion.div>
          )}

          {isObfuscating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass-card border-primary/50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Obfuscating...</h3>
                      <span className="text-primary font-bold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {progress < 30 && "Analyzing binary structure..."}
                      {progress >= 30 && progress < 60 && "Applying control flow obfuscation..."}
                      {progress >= 60 && progress < 90 && "Encrypting constants and strings..."}
                      {progress >= 90 && "Finalizing obfuscation..."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Obfuscation Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="control-flow" className="cursor-pointer">
                    Control Flow
                  </Label>
                  <Switch
                    id="control-flow"
                    checked={options.controlFlow}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, controlFlow: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="string-encryption" className="cursor-pointer">
                    String Encryption
                  </Label>
                  <Switch
                    id="string-encryption"
                    checked={options.stringEncryption}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, stringEncryption: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="anti-debug" className="cursor-pointer">
                    Anti-Debug
                  </Label>
                  <Switch
                    id="anti-debug"
                    checked={options.antiDebug}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, antiDebug: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="api-hiding" className="cursor-pointer">
                    API Hiding
                  </Label>
                  <Switch
                    id="api-hiding"
                    checked={options.apiHiding}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, apiHiding: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle className="text-sm">Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Supported formats: .exe, .dll</p>
                <p>• Maximum file size: 100MB</p>
                <p>• Average processing time: 2-5 seconds</p>
                <p>• Encryption: AES-256-GCM</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Analysis Results Section - Only show after obfuscation complete */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="border-t border-border pt-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Analysis Results
            </h2>
          </div>
          <AnalysisDashboard />
        </motion.div>
      )}

      {/* Activity Log - Always visible */}
      <ActivityLog />
    </div>
  );
};

export default Dashboard;
