import { useEffect, useRef, useState, useCallback } from 'react';
import { Check, ChevronDown } from 'lucide-react';
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
import { supabase } from '@/lib/supabase';

interface Feeder {
    id_unico: string;
    name: string;
}

interface InfiniteScrollFeederSelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function InfiniteScrollFeederSelect({
    value,
    onValueChange,
    placeholder = "Select a feeder...",
    className,
}: InfiniteScrollFeederSelectProps) {
    const [open, setOpen] = useState(false);
    const [feeders, setFeeders] = useState<Feeder[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeederData, setSelectedFeederData] = useState<Feeder | null>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    const PAGE_SIZE = 5;

    const fetchFeeders = useCallback(async (pageNum: number, search: string = '', force: boolean = false) => {
        if (isLoading && !force) return;

        setIsLoading(true);
        try {
            let query = supabase
                .from('feeders')
                .select('id_unico, name')
                .order('created_at', { ascending: false });

            // Apply search filter if exists
            if (search.trim()) {
                query = query.or(`id_unico.ilike.%${search}%,name.ilike.%${search}%`);
            }

            // Apply pagination
            const from = pageNum * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            query = query.range(from, to);

            const { data, error } = await query;

            if (error) throw error;

            if (data && data.length > 0) {
                if (pageNum === 0) {
                    setFeeders(data);
                } else {
                    setFeeders(prev => [...prev, ...data]);
                }
                setHasMore(data.length === PAGE_SIZE);
            } else {
                setHasMore(false);
                if (pageNum === 0) {
                    setFeeders([]);
                }
            }
        } catch (err) {
            console.error('Error fetching feeders:', err);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    // Fetch selected feeder when value changes (for edit mode)
    useEffect(() => {
        const fetchSelectedFeeder = async () => {
            if (!value) {
                setSelectedFeederData(null);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('feeders')
                    .select('id_unico, name')
                    .eq('id_unico', value)
                    .single();

                if (error) throw error;
                if (data) {
                    setSelectedFeederData(data);
                }
            } catch (err) {
                console.error('Error fetching selected feeder:', err);
            }
        };

        fetchSelectedFeeder();
    }, [value]);

    // Initial fetch when dropdown opens - always fetch fresh data
    useEffect(() => {
        if (open) {
            setPage(0);
            setFeeders([]);
            setHasMore(true);
            setSearchTerm('');
            // Force fetch to ensure we hit the API
            fetchFeeders(0, '', true);
        }
    }, [open]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!open) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && feeders.length > 0) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchFeeders(nextPage, searchTerm);
                }
            },
            { threshold: 1.0 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [open, hasMore, isLoading, page, fetchFeeders, searchTerm]);

    // Handle search with debounce
    useEffect(() => {
        if (!open) return;

        const timeoutId = setTimeout(() => {
            // Only fetch if we have a search term (initial load handled by on-open effect)
            if (searchTerm !== '') {
                setPage(0);
                setFeeders([]);
                setHasMore(true);
                fetchFeeders(0, searchTerm);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, open]);

    const selectedFeeder = feeders.find((feeder) => feeder.id_unico === value) || selectedFeederData;

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {selectedFeeder ? (
                        <span className="truncate">
                            {selectedFeeder.name}
                        </span>
                    ) : (
                        placeholder
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" side="bottom" align="start" sideOffset={5} avoidCollisions={false}>
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search feeders..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList className="max-h-[200px]">
                        <CommandEmpty>
                            {isLoading ? "Loading..." : "No feeders found."}
                        </CommandEmpty>
                        <CommandGroup>
                            {feeders.map((feeder) => (
                                <CommandItem
                                    key={feeder.id_unico}
                                    value={feeder.id_unico}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === feeder.id_unico ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {feeder.name}
                                </CommandItem>
                            ))}
                            {hasMore && (
                                <div ref={observerTarget} className="py-2 text-center text-sm text-muted-foreground">
                                    {isLoading ? "Loading more..." : "Scroll for more"}
                                </div>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
