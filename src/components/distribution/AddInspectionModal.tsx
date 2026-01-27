import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InfiniteScrollFeederSelect } from "@/components/InfiniteScrollFeederSelect";
import { InfiniteScrollCarSelect } from "@/components/InfiniteScrollCarSelect";

interface AddInspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        name: string;
        feeder: string;
        car: string;
    };
    onFormChange: (data: { name: string; feeder: string; car: string }) => void;
    onAdd: () => void;
    mode?: 'add' | 'edit';
}

export function AddInspectionModal({
    isOpen,
    onClose,
    formData,
    onFormChange,
    onAdd,
    mode = 'add',
}: AddInspectionModalProps) {
    const isEditMode = mode === 'edit';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] sm:top-[30%]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-700">
                        {isEditMode ? 'Edit Inspection' : 'Add Distribution Inspection'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-1">
                    <div className="space-y-1">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                            placeholder="Enter name"
                            className="h-9"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="feeder" className="text-sm font-medium text-gray-700">
                            Feeder
                        </Label>
                        <InfiniteScrollFeederSelect
                            value={formData.feeder}
                            onValueChange={(val) => onFormChange({ ...formData, feeder: val })}
                            placeholder="Select a feeder..."
                            className="h-9"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="car" className="text-sm font-medium text-gray-700">
                            Car
                        </Label>
                        <InfiniteScrollCarSelect
                            value={formData.car}
                            onValueChange={(val) => onFormChange({ ...formData, car: val })}
                            placeholder="Select a car..."
                            className="h-9"
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="h-9 px-5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onAdd}
                        disabled={!formData.name || !formData.feeder || !formData.car}
                        className="h-9 px-5 bg-blue-600 hover:bg-blue-700"
                    >
                        {isEditMode ? 'Update' : 'Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
