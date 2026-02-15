import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadDropZoneProps {
    isDragging: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputId: string;
    title: string;
}

export function UploadDropZone({
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileSelect,
    inputId,
    title,
}: UploadDropZoneProps) {
    return (
        <Card className="p-8">
            <div className="text-center mb-4">
                <h3 className="text-lg font-medium mb-2">{title}</h3>
            </div>

            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
            >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-2">
                    Drop files here to upload
                </p>
                <p className="text-sm text-muted-foreground mb-4">or</p>
                <label htmlFor={inputId}>
                    <Button
                        type="button"
                        onClick={() => document.getElementById(inputId)?.click()}
                    >
                        Browse Files
                    </Button>
                </label>
                <input
                    id={inputId}
                    type="file"
                    multiple
                    accept=".zip"
                    className="hidden"
                    onChange={onFileSelect}
                />
                <p className="text-xs text-muted-foreground mt-3">Only .zip files are accepted</p>
            </div>
        </Card>
    );
}
