import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

const ACTION_OPTIONS = [
    { value: 'immediate', label: 'Immediate replacement' },
    { value: 'scheduled', label: 'Scheduled maintenance' },
    { value: 'monitor', label: 'Continue monitoring' },
    { value: 'none', label: 'No action required' },
];

interface SearchableActionSelectProps {
    value: string;
    onValueChange: (value: string) => void;
}

export function SearchableActionSelect({
    value,
    onValueChange,
}: SearchableActionSelectProps) {
    const [open, setOpen] = useState(false);

    const selectedLabel = ACTION_OPTIONS.find((o) => o.value === value)?.label;

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-8 justify-between px-2 text-sm font-normal"
                >
                    <span className="truncate">
                        {selectedLabel ?? 'Select action...'}
                    </span>
                    <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[220px] p-0"
                side="bottom"
                align="start"
                sideOffset={4}
            >
                <Command>
                    <CommandInput placeholder="Search action..." />
                    <CommandList className="max-h-[200px]">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {ACTION_OPTIONS.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onValueChange(option.value === value ? '' : option.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === option.value ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
