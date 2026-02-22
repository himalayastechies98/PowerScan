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

interface SearchableElementSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    elements: { id: string; name: string }[];
}

export function SearchableElementSelect({
    value,
    onValueChange,
    elements,
}: SearchableElementSelectProps) {
    const [open, setOpen] = useState(false);

    const selectedLabel = elements.find((el) => el.name === value)?.name ?? value;

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
                        {value ? selectedLabel : 'Select element...'}
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
                    <CommandInput placeholder="Search element..." />
                    <CommandList className="max-h-[200px]">
                        {elements.length === 0 ? (
                            <CommandEmpty>No elements configured.</CommandEmpty>
                        ) : (
                            <>
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup>
                                    {elements.map((el) => (
                                        <CommandItem
                                            key={el.id}
                                            value={el.name}
                                            onSelect={(currentValue) => {
                                                onValueChange(currentValue === value ? '' : currentValue);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    value === el.name ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                            {el.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
