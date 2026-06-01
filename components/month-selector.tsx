'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FetchCaseDialog } from '@/features/cases/components/fetch-case-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Plus } from 'lucide-react';
import { parseMonthYear } from '@/lib/utils/case-utils';
import { CaseUnit } from '@/src/entities/models/case.model';
import { listCasesAction } from '@/features/cases/cases.actions';

interface MonthSelectorProps {
    disabled?: boolean;
    lockedCaseId?: number | null;
    lockedMonthYear?: string | null;
}

export function MonthSelector({ disabled, lockedCaseId, lockedMonthYear }: MonthSelectorProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [availableCases, setAvailableCases] = useState<CaseUnit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCasesOpen, setIsCasesOpen] = useState(false);

    const urlMonthYear = searchParams.get('monthYear');
    const urlCaseIds = searchParams.get('caseIds');

    const effectiveMonthYear =
        disabled && lockedMonthYear
            ? lockedMonthYear
            : urlMonthYear ?? '';

    const selectedCaseIds = useMemo(() => {
        if (disabled && lockedCaseId != null) {
            return [lockedCaseId];
        }

        return urlCaseIds
            ? urlCaseIds
                .split(',')
                .map(Number)
                .filter(id => !Number.isNaN(id))
            : [];
    }, [disabled, lockedCaseId, urlCaseIds]);

    const refreshCases = async () => {
        setIsLoading(true);

        try {
            const data = await listCasesAction();
            setAvailableCases(data.units ?? []);
        } catch {
            setAvailableCases([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshCases();
    }, []);

    const getMonthName = (month: number) =>
        new Date(0, month - 1).toLocaleString('de-DE', { month: 'long' });

    const monthOptions = useMemo(() => {
        const uniqueMonths = new Set<string>();

        availableCases.forEach(unit => {
            unit.months.forEach(monthYear => {
                uniqueMonths.add(monthYear);
            });
        });

        return Array.from(uniqueMonths)
            .map(monthYear => ({
                monthYear,
                ...parseMonthYear(monthYear),
            }))
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            });
    }, [availableCases]);

    const casesForSelectedMonth = useMemo(() => {
        if (!effectiveMonthYear) return [];

        return availableCases.filter(unit =>
            unit.months.includes(effectiveMonthYear)
        );
    }, [availableCases, effectiveMonthYear]);

    const handleMonthYearChange = (monthYear: string) => {
        const params = new URLSearchParams(searchParams.toString());

        params.set('monthYear', monthYear);
        params.delete('caseIds');
        params.delete('caseId');

        router.push(`${pathname}?${params.toString()}`);
    };

    const toggleCaseId = (caseId: number) => {
        const alreadySelected = selectedCaseIds.includes(caseId);

        const nextCaseIds = alreadySelected
            ? selectedCaseIds.filter(id => id !== caseId)
            : [...selectedCaseIds, caseId];

        const params = new URLSearchParams(searchParams.toString());

        params.set('monthYear', effectiveMonthYear);

        if (nextCaseIds.length > 0) {
            params.set('caseIds', nextCaseIds.join(','));

            // Keep old single-case value for old pages/backend compatibility
            params.set('caseId', String(nextCaseIds[0]));
        } else {
            params.delete('caseIds');
            params.delete('caseId');
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-3 w-full max-w-[380px]">
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-muted-foreground">Month:</span>

                <Select
                    value={effectiveMonthYear}
                    onValueChange={handleMonthYearChange}
                    disabled={disabled || isLoading}
                >
                    <SelectTrigger className="w-[174px]">
                        <SelectValue placeholder="Wähle Monat" />
                    </SelectTrigger>

                    <SelectContent className="max-h-[240px] overflow-y-auto">
                        {monthOptions.map(option => (
                            <SelectItem
                                key={option.monthYear}
                                value={option.monthYear}
                            >
                                {getMonthName(option.month)} {option.year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {effectiveMonthYear && (
                <div className="relative shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 w-[128px] justify-between px-2 text-sm"
                        onClick={() => setIsCasesOpen(open => !open)}
                        disabled={disabled || isLoading}
                    >
                        <span>Cases ({casesForSelectedMonth.length})</span>
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${isCasesOpen ? 'rotate-180' : ''}`}
                        />
                    </Button>

                    {isCasesOpen && (
                        <div className="absolute left-0 top-full z-50 mt-1 w-full">
                            <ScrollArea className="h-40 rounded-md border bg-background shadow-lg">
                                <div className="flex flex-col gap-1 p-2">
                                    {casesForSelectedMonth.map(unit => {
                                        const selected = selectedCaseIds.includes(unit.unitId);

                                        return (
                                            <button
                                                key={unit.unitId}
                                                type="button"
                                                disabled={disabled || isLoading}
                                                onClick={() => toggleCaseId(unit.unitId)}
                                                className={`
                                                    flex items-center gap-2 rounded px-2 py-1 text-left text-sm
                                                    hover:bg-muted transition
                                                    ${selected ? 'bg-muted font-medium' : ''}
                                                `}
                                            >
                                                <div
                                                    className={`
                                                        w-4 h-4 shrink-0 border rounded flex items-center justify-center text-xs
                                                        ${selected ? 'bg-primary text-primary-foreground border-primary' : ''}
                                                    `}
                                                >
                                                    {selected ? '✓' : ''}
                                                </div>

                                                <span className="truncate">Case {unit.unitId}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            )}

            <div className="shrink-0">
                <Button
                    size="sm"
                    disabled={disabled || isLoading}
                    onClick={() => setDialogOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <FetchCaseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialCaseId={undefined}
                onFetched={(_, my) => {
                    refreshCases();

                    const params = new URLSearchParams(searchParams.toString());
                    params.set('monthYear', my);
                    params.delete('caseIds');
                    params.delete('caseId');

                    router.push(`${pathname}?${params.toString()}`);
                }}
            />
        </div>
    );
}
