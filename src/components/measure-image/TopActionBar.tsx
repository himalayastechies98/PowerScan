import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RotateCcw, FileDown, FileType, Eye } from "lucide-react";

interface TopActionBarProps {
    inspectionId: string | null;
}

export function TopActionBar({ inspectionId }: TopActionBarProps) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border">
            <div className="flex items-center gap-1.5">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => inspectionId && navigate(`/distribution/measures/${inspectionId}`)}
                >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Return to Inspection Measures
                </Button>
            </div>
            <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                    <FileDown className="w-3.5 h-3.5 mr-1.5" />
                    PDF
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                    <FileType className="w-3.5 h-3.5 mr-1.5" />
                    TIFF
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Optical
                </Button>
            </div>
        </div>
    );
}
