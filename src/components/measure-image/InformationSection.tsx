import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { ChevronDown } from "lucide-react";
import { excelDateToJS, excelTimeToJS } from "@/utils/dateUtils";
import { Measure } from "@/hooks/useMeasureData";

interface InformationSectionProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    measure: Measure | null;
}

export function InformationSection({ isOpen, onOpenChange, measure }: InformationSectionProps) {
    return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
            <Card>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-b">
                    <h3 className="text-base font-semibold text-primary">Information</h3>
                    <ChevronDown className={`w-5 h-5 transition-transform ${!isOpen && "rotate-180"}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-4 gap-x-8 gap-y-5">
                            {/* Row 1 */}
                            <div>
                                <div className="text-sm font-bold mb-1.5">Address</div>
                                <div className="text-sm">{measure?.localizacao || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Camera</div>
                                <div className="text-sm">-</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Inference</div>
                                <div className="text-sm">-</div>
                            </div>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="text-sm font-bold mb-1.5">Coordinates</div>
                                    <div className="text-sm">-</div>
                                </div>
                                <Button variant="default" size="sm" className="h-9 w-9 p-0 ml-2">
                                    💾
                                </Button>
                            </div>

                            {/* Row 2 */}
                            <div>
                                <div className="text-sm font-bold mb-1.5">Date</div>
                                <div className="text-sm">
                                    {excelDateToJS(measure?.data_criacao)} {excelTimeToJS(measure?.data_criacao)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Relative Humidity</div>
                                <div className="text-sm">-</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Wind</div>
                                <div className="text-sm">-</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Temperature</div>
                                <div className="text-sm">
                                    {measure?.temp1_c ? `${measure.temp1_c.toFixed(2)}°C` : '-'}
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div>
                                <div className="text-sm font-bold mb-1.5">Detected Feeders</div>
                                <div className="text-sm">-</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Inspection Name</div>
                                <div className="text-sm">-</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Inspection Feeder</div>
                                <div className="text-sm text-primary font-medium">-</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Speed</div>
                                <div className="text-sm">-</div>
                            </div>

                            {/* Row 4 */}
                            <div className="col-span-3">
                                <div className="text-sm font-bold mb-1.5">Observations</div>
                                <textarea
                                    className="w-full h-24 px-3 py-2 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="update this"
                                ></textarea>
                            </div>
                            <div>
                                <div className="text-sm font-bold mb-1.5">Load</div>
                                <div className="flex items-center gap-3">
                                    <Slider value={[100]} max={100} className="flex-1" />
                                    <span className="text-sm font-semibold min-w-[45px]">100%</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <Button variant="default" size="sm" className="h-9 px-4">
                                💾 Save
                            </Button>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
