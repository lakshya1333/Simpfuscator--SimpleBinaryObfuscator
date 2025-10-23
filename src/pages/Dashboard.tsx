import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Download, Shield, Lock, Key, FileCheck } from "lucide-react";
import UploadSection from "@/components/UploadSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateKeyPair, signFile, hashFile } from "@/utils/digitalSignature";

type EncryptionType = "xor" | "rsa" | "aes" | "rc4" | "des";

const Dashboard = () => {
  const [selectedEncryption, setSelectedEncryption] = useState<EncryptionType | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isObfuscating, setIsObfuscating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [obfuscatedFileUrl, setObfuscatedFileUrl] = useState<string | null>(null);
  const [obfuscationData, setObfuscationData] = useState<any>(null);
  const [publicKey, setPublicKey] = useState<string>("");
  const [isSigningFile, setIsSigningFile] = useState(false);
  const { toast } = useToast();

  // Initialize RSA key pair on component mount
  useEffect(() => {
    const initializeKeys = async () => {
      try {
        const { publicKeyPem } = await getOrCreateKeyPair();
        setPublicKey(publicKeyPem);
        console.log("Digital signature keys initialized");
      } catch (error) {
        console.error("Failed to initialize keys:", error);
        toast({
          title: "Warning",
          description: "Failed to initialize digital signature keys",
          variant: "destructive",
        });
      }
    };
    initializeKeys();
  }, []);

  const encryptionOptions = [
    { value: "xor", label: "XOR Encryption", description: "Fast bitwise operation encryption" },
    { value: "rsa", label: "RSA Encryption", description: "Public-key cryptography algorithm" },
    { value: "aes", label: "AES Encryption", description: "Advanced Encryption Standard (256-bit)" },
    { value: "rc4", label: "RC4 Encryption", description: "Stream cipher encryption" },
    { value: "des", label: "DES Encryption", description: "Data Encryption Standard" },
  ];

  const startObfuscation = async () => {
    if (!selectedEncryption) {
      toast({
        title: "No encryption type selected",
        description: "Please select an encryption type first",
        variant: "destructive",
      });
      return;
    }

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
    setObfuscatedFileUrl(null);
    setObfuscationData(null);

    try {
      // Step 1: Sign the file
      setIsSigningFile(true);
      toast({
        title: "Signing file...",
        description: "Creating digital signature for secure upload",
      });

      const { keyPair, publicKeyPem } = await getOrCreateKeyPair();
      const fileHash = await hashFile(uploadedFile);
      const signature = await signFile(keyPair.privateKey, fileHash);

      setIsSigningFile(false);

      // Step 2: Create FormData with file, encryption type, signature, and public key
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("encryptionType", selectedEncryption);
      formData.append("signature", signature);
      formData.append("publicKey", publicKeyPem);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Step 3: Call backend API to verify and obfuscate file
      const response = await fetch("/api/obfuscate", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // Set the obfuscated file URL and metadata
      setObfuscatedFileUrl(data.fileUrl || data.downloadUrl);
      setObfuscationData(data);
      
      setProgress(100);
      setIsObfuscating(false);
      setIsComplete(true);

      toast({
        title: "Obfuscation complete!",
        description: "Your binary has been successfully obfuscated",
      });
    } catch (error) {
      console.error("Obfuscation error:", error);
      setIsObfuscating(false);
      setProgress(0);
      
      let errorMessage = "An error occurred during obfuscation";
      
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          errorMessage = "Cannot connect to backend server. Make sure it's running on port 5000.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Obfuscation failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const downloadObfuscatedFile = () => {
    if (!obfuscatedFileUrl) return;

    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = obfuscatedFileUrl;
    link.download = `obfuscated_${uploadedFile?.name || "file"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Combined Upload and Encryption Selection Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Upload & Configure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Compact Encryption Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Encryption Type
              </Label>
              <RadioGroup
                value={selectedEncryption || ""}
                onValueChange={(value) => setSelectedEncryption(value as EncryptionType)}
                className="grid grid-cols-2 md:grid-cols-5 gap-2"
              >
                {encryptionOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`relative flex items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                      selectedEncryption === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedEncryption(option.value as EncryptionType)}
                  >
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.value} 
                      className="sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className="cursor-pointer text-center"
                    >
                      <div className="font-semibold text-sm">{option.value.toUpperCase()}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {selectedEncryption && (
                <p className="text-xs text-muted-foreground">
                  {encryptionOptions.find(opt => opt.value === selectedEncryption)?.description}
                </p>
              )}
            </div>

            {/* Upload Section */}
            {selectedEncryption ? (
              <div className="space-y-4 pt-2 border-t border-border">
                <UploadSection onFileUploaded={setUploadedFile} />

                {isSigningFile && (
                  <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium">
                      Signing file with digital signature...
                    </span>
                  </div>
                )}

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
                      Obfuscate File
                    </Button>
                  </motion.div>
                )}

                {isObfuscating && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="glass-card border-primary/50 rounded-lg p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Obfuscating...</h3>
                          <span className="text-primary font-bold">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-sm text-muted-foreground">
                          Running obfuscation process...
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {isComplete && obfuscatedFileUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      onClick={downloadObfuscatedFile}
                      className="w-full h-14 text-lg bg-gradient-to-r from-secondary to-primary hover:opacity-90 text-primary-foreground font-semibold"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Obfuscated File
                    </Button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select an encryption type to upload files</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Obfuscation Details Section - Space for debug info, encryption key, sections, etc. */}
      {isComplete && obfuscationData && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="border-t border-border pt-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Obfuscation Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* TODO: Add your debug info cards here */}
            {/* Example structure - you can modify/add more as needed */}
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Digital Signature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {obfuscationData.signatureVerified ? (
                    <>
                      <Shield className="h-5 w-5 text-green-500" />
                      <span className="text-lg font-semibold text-green-500">Verified</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 text-yellow-500" />
                      <span className="text-lg font-semibold text-yellow-500">Not Signed</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Encryption Type</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold uppercase text-primary">
                  {obfuscationData.encryptionType || "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Encryption Key</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono text-primary break-all">
                  {obfuscationData.encryptionKey || "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Sections Encrypted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {obfuscationData.sectionsEncrypted || "0"}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {obfuscationData.processingTime || "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Key Size</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {obfuscationData.keySize || "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Algorithm Rounds</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {obfuscationData.rounds || "N/A"}
                </p>
              </CardContent>
            </Card>

            {/* Add more cards here for additional debug info */}
          </div>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm">Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Supported formats: .exe, .dll</p>
            <p>• Maximum file size: 100MB</p>
            <p>• Encryption: AES-256-GCM</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
