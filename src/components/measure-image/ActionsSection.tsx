import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface ActionsSectionProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ActionsSection({ isOpen, onOpenChange }: ActionsSectionProps) {
    return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
            <Card>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-b">
                    <h3 className="text-base font-semibold text-primary">Actions</h3>
                    <ChevronDown className={`w-5 h-5 transition-transform ${!isOpen && "rotate-180"}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-3">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-3 text-xs font-semibold">ELEMENT</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold">OP. NUMBERS</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold">ID</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold">TEMPERATURE</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold">T. ABS (°C)</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold">T. DELTA (°C)</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold">FINAL ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b hover:bg-muted/30">
                                        <td className="py-2 px-3" colSpan={7}>
                                            <div className="text-xs text-muted-foreground text-center">
                                                No actions defined
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
