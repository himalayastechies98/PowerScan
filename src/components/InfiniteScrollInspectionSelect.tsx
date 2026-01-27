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

interface Inspection {
    id_unico: string;
    name: string;
    ea: string;
}

interface InfiniteScrollInspectionSelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function InfiniteScrollInspectionSelect({
    value,
    onValueChange,
    placeholder = "Select an inspection...",
    className,
}: InfiniteScrollInspectionSelectProps) {
    const [open, setOpen] = useState(false);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const observerTarget = useRef<HTMLDivElement>(null);

    const PAGE_SIZE = 5;

    const fetchInspections = useCallback(async (pageNum: number, search: string = '', force: boolean = false) => {
        if (isLoading && !force) return;

        setIsLoading(true);
        try {
            let query = supabase
                .from('inspections')
                .select('id_unico, name, ea')
                .order('created_at', { ascending: false });

            // Apply search filter if exists
            if (search.trim()) {
                query = query.or(`id_unico.ilike.%${search}%,name.ilike.%${search}%,ea.ilike.%${search}%`);
            }

            // Apply pagination
            const from = pageNum * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            query = query.range(from, to);

            const { data, error } = await query;

            if (error) throw error;

            if (data && data.length > 0) {
                if (pageNum === 0) {
                    setInspections(data);
                } else {
                    setInspections(prev => [...prev, ...data]);
                }
                setHasMore(data.length === PAGE_SIZE);
            } else {
                setHasMore(false);
                if (pageNum === 0) {
                    setInspections([]);
                }
            }
        } catch (err) {
            console.error('Error fetching inspections:', err);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    // Initial fetch when dropdown opens - always fetch fresh data
    useEffect(() => {
        if (open) {
            setPage(0);
            setInspections([]);
            setHasMore(true);
            setSearchTerm('');
            // Force fetch to ensure we hit the API
            fetchInspections(0, '', true);
        }
    }, [open]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!open) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && inspections.length > 0) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchInspections(nextPage, searchTerm);
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
    }, [open, hasMore, isLoading, page, fetchInspections, searchTerm, inspections.length]);

    // Handle search with debounce
    useEffect(() => {
        if (!open) return;

        const timeoutId = setTimeout(() => {
            // Only fetch if we have a search term (initial load handled by on-open effect)
            if (searchTerm !== '') {
                setPage(0);
                setInspections([]);
                setHasMore(true);
                fetchInspections(0, searchTerm);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, open]);

    const selectedInspection = inspections.find((inspection) => inspection.id_unico === value);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {selectedInspection ? (
                        <span className="truncate">
                            {selectedInspection.name} - {selectedInspection.ea}
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
                        placeholder="Search inspections..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList className="max-h-[200px]">
                        <CommandEmpty>
                            {isLoading ? "Loading..." : "No inspections found."}
                        </CommandEmpty>
                        <CommandGroup>
                            {inspections.map((inspection) => (
                                <CommandItem
                                    key={inspection.id_unico}
                                    value={inspection.id_unico}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === inspection.id_unico ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {inspection.name} - {inspection.ea}
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
