import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UploadStatsProps {
    stats: {
        total: number;
        queue: number;
        uploaded: number;
        errors: number;
        sending: number;
    };
    onClear: () => void;
}

export function UploadStats({ stats, onClear }: UploadStatsProps) {
    return (
        <Card className="p-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-8">
                    <div>
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="text-2xl font-semibold">{stats.total}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Queue</div>
                        <div className="text-2xl font-semibold text-orange-600">{stats.queue}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Uploaded</div>
                        <div className="text-2xl font-semibold text-green-600">{stats.uploaded}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Errors</div>
                        <div className="text-2xl font-semibold text-red-600">{stats.errors}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Sending</div>
                        <div className="text-2xl font-semibold text-blue-600">{stats.sending}</div>
                    </div>
                </div>
                <Button variant="outline" onClick={onClear}>
                    Clear
                </Button>
            </div>
        </Card>
    );
}
