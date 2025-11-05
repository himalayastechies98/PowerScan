import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: "queue" | "sending" | "error" | "complete";
}

export default function UploadMeasures() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles: UploadFile[] = droppedFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      size: file.size,
      status: "queue" as const,
    }));
    
    setFiles([...files, ...newFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles: UploadFile[] = selectedFiles.map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        status: "queue" as const,
      }));
      
      setFiles([...files, ...newFiles]);
    }
  };

  const handleClear = () => {
    setFiles([]);
  };

  const stats = {
    total: files.length,
    queue: files.filter(f => f.status === "queue").length,
    errors: files.filter(f => f.status === "error").length,
    sending: files.filter(f => f.status === "sending").length,
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs defaultValue="vehicle" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="vehicle">Vehicle Thermographic Measures / Traces</TabsTrigger>
          <TabsTrigger value="drone">Drone Thermographic Measures</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicle" className="space-y-4">
          <Card className="p-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium mb-2">
                You are uploading thermographic measures / traces
              </h3>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                Drop files here to upload
              </p>
              <p className="text-sm text-muted-foreground mb-4">or</p>
              <label htmlFor="vehicle-file-input">
                <Button type="button" onClick={() => document.getElementById('vehicle-file-input')?.click()}>
                  Browse Files
                </Button>
              </label>
              <input
                id="vehicle-file-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="drone" className="space-y-4">
          <Card className="p-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium mb-2">
                You are uploading drone thermographic measures
              </h3>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                Drop files here to upload
              </p>
              <p className="text-sm text-muted-foreground mb-4">or</p>
              <label htmlFor="drone-file-input">
                <Button type="button" onClick={() => document.getElementById('drone-file-input')?.click()}>
                  Browse Files
                </Button>
              </label>
              <input
                id="drone-file-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Status */}
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-8">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-semibold">{stats.total}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Queue</div>
              <div className="text-2xl font-semibold text-blue-600">{stats.queue}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Errors</div>
              <div className="text-2xl font-semibold text-red-600">{stats.errors}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sending</div>
              <div className="text-2xl font-semibold text-green-600">{stats.sending}</div>
            </div>
          </div>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </Card>
    </div>
  );
}
