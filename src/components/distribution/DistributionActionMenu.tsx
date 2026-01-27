import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, RefreshCw, FileText, Upload as UploadIcon, FolderOpen, Copy, Edit, Trash2, Bell, MapPin, Sparkles, RotateCcw } from "lucide-react";

interface DistributionActionMenuProps {
    recordId: string;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}

export function DistributionActionMenu({ recordId, onDelete, onEdit }: DistributionActionMenuProps) {
    const navigate = useNavigate();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    Action <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reprocess
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    Inspection Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/upload/${recordId}`)}>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Re-Open
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Id
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(recordId)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(recordId)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Bell className="mr-2 h-4 w-4" />
                        Alarms
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem>View Alarms</DropdownMenuItem>
                        <DropdownMenuItem>Configure Alarms</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <MapPin className="mr-2 h-4 w-4" />
                        Addresses
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem>View Addresses</DropdownMenuItem>
                        <DropdownMenuItem>Edit Addresses</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem>AI Analysis</DropdownMenuItem>
                        <DropdownMenuItem>AI Suggestions</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Update Counters
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
