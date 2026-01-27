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

interface Action {
    id: string;
    name: string;
    priority: number;
}

interface InfiniteScrollActionSelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    initialData?: { id: string; name: string; priority?: number } | null;
}

export function InfiniteScrollActionSelect({
    value,
    onValueChange,
    placeholder = "Select an action...",
    className,
    initialData,
}: InfiniteScrollActionSelectProps) {
    const [open, setOpen] = useState(false);
    const [actions, setActions] = useState<Action[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const observerTarget = useRef<HTMLDivElement>(null);

    const PAGE_SIZE = 5;

    const fetchActions = useCallback(async (pageNum: number, search: string = '', force: boolean = false) => {
        if (isLoading && !force) return;

        setIsLoading(true);
        try {
            let query = supabase
                .from('actions')
                .select('id, name, priority')
                .order('name', { ascending: true });

            // Apply search filter if exists
            if (search.trim()) {
                query = query.ilike('name', `%${search}%`);
            }

            // Apply pagination
            const from = pageNum * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            query = query.range(from, to);

            const { data, error } = await query;

            if (error) throw error;

            if (data && data.length > 0) {
                if (pageNum === 0) {
                    setActions(prev => {
                        // Keep initialData if it exists and matches value
                        if (initialData && initialData.id === value && !data.find(d => d.id === initialData.id)) {
                            return [initialData as Action, ...data];
                        }
                        return data;
                    });
                } else {
                    setActions(prev => [...prev, ...data]);
                }
                setHasMore(data.length === PAGE_SIZE);
            } else {
                setHasMore(false);
                if (pageNum === 0) {
                    setActions(initialData && initialData.id === value ? [initialData as Action] : []);
                }
            }
        } catch (err) {
            console.error('Error fetching actions:', err);
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
            // setActions([]);
            setHasMore(true);
            setSearchTerm('');
            // Force fetch to ensure we hit the API
            fetchActions(0, '', true);
        }
    }, [open]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!open) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && actions.length > 0) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchActions(nextPage, searchTerm);
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
    }, [open, hasMore, isLoading, page, fetchActions, searchTerm, actions.length]);

    // Handle search with debounce
    useEffect(() => {
        if (!open) return;

        const timeoutId = setTimeout(() => {
            // Only fetch if we have a search term (initial load handled by on-open effect)
            if (searchTerm !== '') {
                setPage(0);
                setActions([]);
                setHasMore(true);
                fetchActions(0, searchTerm);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, open]);

    // Use initialData to populate selected action if not found in list
    useEffect(() => {
        if (initialData && value === initialData.id) {
            setActions(prev => {
                if (prev.find(a => a.id === initialData.id)) return prev;
                return [initialData as Action, ...prev];
            });
        }
    }, [initialData, value]);

    const selectedAction = actions.find((action) => action.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {selectedAction ? (
                        <span className="truncate">
                            {selectedAction.name}
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
                        placeholder="Search actions..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList className="max-h-[200px]">
                        <CommandEmpty>
                            {isLoading ? "Loading..." : "No actions found."}
                        </CommandEmpty>
                        <CommandGroup>
                            {actions.map((action) => (
                                <CommandItem
                                    key={action.id}
                                    value={action.id}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === action.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {action.name}
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
