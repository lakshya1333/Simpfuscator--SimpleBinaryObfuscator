import { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File; // Add the actual File object
}

const UploadSection = ({ onFileUploaded }: { onFileUploaded?: (file: File) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File) => {
    const validExtensions = [".exe", ".dll"];
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));
    
    if (!validExtensions.includes(fileExtension.toLowerCase())) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .exe or .dll file",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) return;

    const fileData: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      file: file, // Store the actual File object
    };

    setUploadedFile(fileData);
    setIsProcessing(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast({
            title: "Upload successful",
            description: `${file.name} has been uploaded successfully`,
          });
          onFileUploaded?.(file); // Pass the actual File object
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-card rounded-2xl p-8 border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? "border-primary neon-glow"
            : uploadedFile
            ? "border-secondary neon-glow-green"
            : "border-border"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {uploadedFile ? (
            <CheckCircle2 className="h-16 w-16 text-secondary animate-glow-pulse" />
          ) : (
            <Upload className="h-16 w-16 text-primary animate-glow-pulse" />
          )}

          <div>
            <h3 className="text-xl font-semibold mb-2">
              {uploadedFile ? "File Ready" : "Drop your binary here"}
            </h3>
            <p className="text-muted-foreground">
              {uploadedFile
                ? "Your file is ready for obfuscation"
                : "Support for .exe and .dll files (max 100MB)"}
            </p>
          </div>

          {!uploadedFile && (
            <>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".exe,.dll"
                onChange={handleFileInput}
              />
              <Button
                asChild
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold"
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {uploadedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <File className="h-10 w-10 text-primary" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">
                  {uploadedFile.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="text-primary font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default UploadSection;
