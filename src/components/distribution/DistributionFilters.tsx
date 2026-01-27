import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { InfiniteScrollCarSelect } from "@/components/InfiniteScrollCarSelect";
import { InfiniteScrollFeederSelect } from "@/components/InfiniteScrollFeederSelect";
import { InfiniteScrollInspectionSelect } from "@/components/InfiniteScrollInspectionSelect";

interface DistributionFiltersProps {
    dateRange: { from: Date; to: Date };
    setDateRange: (range: { from: Date; to: Date }) => void;
    inspections: string;
    setInspections: (value: string) => void;
    cars: string;
    setCars: (value: string) => void;
    feeders: string;
    setFeeders: (value: string) => void;
    onClear: () => void;
    onAdd: () => void;
}

export function DistributionFilters({
    dateRange,
    setDateRange,
    inspections,
    setInspections,
    cars,
    setCars,
    feeders,
    setFeeders,
    onClear,
    onAdd,
}: DistributionFiltersProps) {
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    return (
        <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">Date</label>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from && dateRange.to
                                    ? `${format(dateRange.from, "MM/dd/yyyy")} - ${format(dateRange.to, "MM/dd/yyyy")}`
                                    : "Select date range"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <div className="flex">
                                {/* Quick Select Sidebar */}
                                <div className="w-44 bg-muted/30 border-r p-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-sm font-normal mb-1"
                                        onClick={() => {
                                            const today = new Date();
                                            setDateRange({ from: today, to: today });
                                        }}
                                    >
                                        Today
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-sm font-normal mb-1"
                                        onClick={() => {
                                            const yesterday = new Date();
                                            yesterday.setDate(yesterday.getDate() - 1);
                                            setDateRange({ from: yesterday, to: yesterday });
                                        }}
                                    >
                                        Yesterday
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-sm font-normal mb-1"
                                        onClick={() => {
                                            const today = new Date();
                                            const lastWeek = new Date();
                                            lastWeek.setDate(lastWeek.getDate() - 7);
                                            setDateRange({ from: lastWeek, to: today });
                                        }}
                                    >
                                        Last 7 days
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-sm font-normal mb-1"
                                        onClick={() => {
                                            const today = new Date();
                                            const last30 = new Date();
                                            last30.setDate(last30.getDate() - 30);
                                            setDateRange({ from: last30, to: today });
                                        }}
                                    >
                                        Last 30 days
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-sm font-normal mb-1"
                                        onClick={() => {
                                            const today = new Date();
                                            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                            setDateRange({ from: firstDay, to: today });
                                        }}
                                    >
                                        This month
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-sm font-normal mb-1"
                                        onClick={() => {
                                            const today = new Date();
                                            const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                                            const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                                            setDateRange({ from: firstDayLastMonth, to: lastDayLastMonth });
                                        }}
                                    >
                                        Last month
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="w-full justify-start text-sm font-normal"
                                    >
                                        Personalized
                                    </Button>
                                </div>

                                {/* Calendars */}
                                <div className="flex gap-4 p-4">
                                    <Calendar
                                        mode="single"
                                        selected={dateRange.from}
                                        onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                                        defaultMonth={dateRange.from}
                                        disabled={(date) => date > new Date()}
                                        captionLayout="dropdown-buttons"
                                        fromYear={2020}
                                        toYear={new Date().getFullYear()}
                                    />
                                    <Calendar
                                        mode="single"
                                        selected={dateRange.to}
                                        onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                                        defaultMonth={dateRange.to}
                                        disabled={(date) => date < dateRange.from || date > new Date()}
                                        captionLayout="dropdown-buttons"
                                        fromYear={2020}
                                        toYear={new Date().getFullYear()}
                                    />
                                </div>
                            </div>

                            {/* Bottom bar with Reset and Apply */}
                            <div className="border-t p-3 flex items-center justify-between bg-background">
                                <span className="text-sm text-muted-foreground">
                                    {dateRange.from && dateRange.to
                                        ? `${format(dateRange.from, "MM/dd/yyyy")} - ${format(dateRange.to, "MM/dd/yyyy")}`
                                        : "Select date range"}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date();
                                            const last60 = new Date();
                                            last60.setDate(last60.getDate() - 60);
                                            setDateRange({ from: last60, to: today });
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => setDatePickerOpen(false)}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">Cars</label>
                    <InfiniteScrollCarSelect
                        value={cars}
                        onValueChange={setCars}
                        placeholder="Select a car..."
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">Inspections</label>
                    <InfiniteScrollInspectionSelect
                        value={inspections}
                        onValueChange={setInspections}
                        placeholder="Select an inspection..."
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">Feeders</label>
                    <InfiniteScrollFeederSelect
                        value={feeders}
                        onValueChange={setFeeders}
                        placeholder="Select a feeder..."
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                    <Button>Filter</Button>
                    <Button onClick={onAdd}>Add</Button>
                    <Button>Export Car</Button>
                </div>
                <Button variant="link" onClick={onClear} className="text-primary">
                    Clear
                </Button>
            </div>
        </Card>
    );
}
