import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
    isVisible: boolean;
    currentProcessing: string;
    progress: number;
}

export function UploadProgressBar({ isVisible, currentProcessing, progress }: UploadProgressProps) {
    if (!isVisible) return null;

    return (
        <Card className="p-6">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">
                        {currentProcessing}
                    </span>
                    <span className="text-sm font-semibold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        </Card>
    );
}
