import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center mb-3 px-12",
        caption_label: "hidden",
        caption_dropdowns: "flex gap-2 items-center justify-center",
        dropdown_month: cn(
          "h-9 appearance-none px-3 py-1.5 text-xs font-semibold rounded-md",
          "border-2 border-border/50 bg-card text-card-foreground",
          "hover:border-primary/30 hover:bg-card",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
          "transition-all duration-200 cursor-pointer",
          "min-w-[115px] text-center"
        ),
        dropdown_year: cn(
          "h-9 appearance-none px-3 py-1.5 text-xs font-semibold rounded-md",
          "border-2 border-border/50 bg-card text-card-foreground",
          "hover:border-primary/30 hover:bg-card",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
          "transition-all duration-200 cursor-pointer",
          "min-w-[85px] text-center"
        ),
        vhidden: "sr-only",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-card/50 p-0 rounded-md border-2 border-border/50",
          "hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
          "transition-all duration-200"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse mt-3",
        head_row: "flex mb-1",
        head_cell: cn(
          "text-muted-foreground/70 rounded-md w-9 h-8",
          "font-bold text-[10px] uppercase tracking-wide",
          "flex items-center justify-center"
        ),
        row: "flex w-full mt-0.5",
        cell: cn(
          "relative p-0 text-center text-sm",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          "h-9 w-9 p-0 font-medium rounded-md mx-auto text-sm",
          "hover:bg-accent/80 hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-all duration-150 ease-in-out",
          "inline-flex items-center justify-center"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-primary text-primary-foreground font-bold",
          "hover:bg-primary/90 hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground"
        ),
        day_today: cn(
          "bg-accent text-accent-foreground font-extrabold",
          "ring-2 ring-primary/40 ring-offset-1 ring-offset-background"
        ),
        day_outside: cn(
          "text-muted-foreground/30 opacity-40",
          "hover:bg-accent/30 hover:text-muted-foreground/50"
        ),
        day_disabled: cn(
          "text-muted-foreground/20 opacity-30 cursor-not-allowed",
          "hover:bg-transparent hover:text-muted-foreground/20"
        ),
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-3.5 w-3.5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-3.5 w-3.5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
