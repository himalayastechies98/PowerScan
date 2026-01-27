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

interface Method {
    id: string;
    name: string;
    formula: string;
}

interface InfiniteScrollMethodSelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    initialData?: { id: string; name: string; formula: string } | null;
}

export function InfiniteScrollMethodSelect({
    value,
    onValueChange,
    placeholder = "Select a method...",
    className,
    initialData,
}: InfiniteScrollMethodSelectProps) {
    const [open, setOpen] = useState(false);
    const [methods, setMethods] = useState<Method[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const observerTarget = useRef<HTMLDivElement>(null);

    const PAGE_SIZE = 5;

    const fetchMethods = useCallback(async (pageNum: number, search: string = '', force: boolean = false) => {
        if (isLoading && !force) return;

        setIsLoading(true);
        try {
            let query = supabase
                .from('methods')
                .select('id, name, formula')
                .order('name', { ascending: true });

            // Apply search filter if exists
            if (search.trim()) {
                query = query.or(`name.ilike.%${search}%,formula.ilike.%${search}%`);
            }

            // Apply pagination
            const from = pageNum * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            query = query.range(from, to);

            const { data, error } = await query;

            if (error) throw error;

            if (data && data.length > 0) {
                if (pageNum === 0) {
                    setMethods(prev => {
                        // Keep initialData if it exists and matches value
                        if (initialData && initialData.id === value && !data.find(d => d.id === initialData.id)) {
                            return [initialData, ...data];
                        }
                        return data;
                    });
                } else {
                    setMethods(prev => [...prev, ...data]);
                }
                setHasMore(data.length === PAGE_SIZE);
            } else {
                setHasMore(false);
                if (pageNum === 0) {
                    setMethods(initialData && initialData.id === value ? [initialData] : []);
                }
            }
        } catch (err) {
            console.error('Error fetching methods:', err);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, initialData, value]);

    // Initial fetch when dropdown opens - always fetch fresh data
    useEffect(() => {
        if (open) {
            setPage(0);
            // Don't clear immediately if we have a selected value, to prevent flickering
            // setMethods([]);
            setHasMore(true);
            setSearchTerm('');
            // Force fetch to ensure we hit the API
            fetchMethods(0, '', true);
        }
    }, [open]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!open) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && methods.length > 0) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchMethods(nextPage, searchTerm);
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
    }, [open, hasMore, isLoading, page, fetchMethods, searchTerm, methods.length]);

    // Handle search with debounce
    useEffect(() => {
        if (!open) return;

        const timeoutId = setTimeout(() => {
            // Only fetch if we have a search term (initial load handled by on-open effect)
            if (searchTerm !== '') {
                setPage(0);
                setMethods([]);
                setHasMore(true);
                fetchMethods(0, searchTerm);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, open]);

    // Use initialData to populate selected method if not found in list
    useEffect(() => {
        if (initialData && value === initialData.id) {
            setMethods(prev => {
                if (prev.find(m => m.id === initialData.id)) return prev;
                return [initialData, ...prev];
            });
        }
    }, [initialData, value]);

    const selectedMethod = methods.find((method) => method.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {selectedMethod ? (
                        <span className="truncate">
                            {selectedMethod.name}
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
                        placeholder="Search methods..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList className="max-h-[200px]">
                        <CommandEmpty>
                            {isLoading ? "Loading..." : "No methods found."}
                        </CommandEmpty>
                        <CommandGroup>
                            {methods.map((method) => (
                                <CommandItem
                                    key={method.id}
                                    value={method.id}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === method.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{method.name}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{method.formula}</span>
                                    </div>
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
