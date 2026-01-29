import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Download, RefreshCw, FileText, Upload as UploadIcon, FolderOpen, Lock, Copy, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DistributionActionMenuProps {
    recordId: string;
    status: string;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onStatusChange: (id: string, newStatus: string) => Promise<void>;
}

export function DistributionActionMenu({ recordId, status, onDelete, onEdit, onStatusChange }: DistributionActionMenuProps) {
    const navigate = useNavigate();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Determine if this is a Re-Open or Close action based on status
    const isFinalizada = status.toLowerCase() === 'finalizada';
    const actionLabel = isFinalizada ? 'Re-Open' : 'Close';
    const newStatus = isFinalizada ? 'Pendiente' : 'Finalizada';
    const ActionIcon = isFinalizada ? FolderOpen : Lock;

    const handleCopyId = () => {
        navigator.clipboard.writeText(recordId);
        toast.success("ID copied to clipboard");
    };

    const handleStatusChangeClick = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmStatusChange = async () => {
        setIsUpdating(true);
        try {
            await onStatusChange(recordId, newStatus);
            toast.success(`Inspection status changed to ${newStatus}`);
            setShowConfirmDialog(false);
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
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
                    <DropdownMenuItem onClick={handleStatusChangeClick}>
                        <ActionIcon className="mr-2 h-4 w-4" />
                        {actionLabel}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyId}>
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
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isFinalizada ? 'Re-Open Inspection' : 'Close Inspection'}
                        </DialogTitle>
                        <DialogDescription>
                            {isFinalizada
                                ? 'Are you sure you want to re-open this inspection? The status will be changed to "Pendiente".'
                                : 'Are you sure you want to close this inspection? The status will be changed to "Finalizada".'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmStatusChange}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                `Yes, ${actionLabel}`
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
