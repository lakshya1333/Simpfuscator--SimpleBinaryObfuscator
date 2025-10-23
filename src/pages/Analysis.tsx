import { motion } from "framer-motion";
import AnalysisDashboard from "@/components/AnalysisDashboard";

const Analysis = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Analysis Results
        </h1>
        <p className="text-muted-foreground">
          Detailed analysis of obfuscation transformations and metrics
        </p>
      </motion.div>

      <AnalysisDashboard />
    </div>
  );
};

export default Analysis;
