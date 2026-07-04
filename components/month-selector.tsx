'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FetchCaseDialog } from '@/features/cases/components/fetch-case-dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Plus, RefreshCw } from 'lucide-react';
import { parseMonthYear } from '@/lib/utils/case-utils';
import { CaseUnit } from '@/src/entities/models/case.model';
import { listCasesAction, refreshCasesFromSolverOptionsAction } from '@/features/cases/cases.actions';

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
    const [isRefreshingOptions, setIsRefreshingOptions] = useState(false);
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

    const refreshCases = useCallback(async (monthYear = effectiveMonthYear) => {
        setIsLoading(true);

        try {
            const data = monthYear
                ? await refreshCasesFromSolverOptionsAction(monthYear)
                : await listCasesAction();
            setAvailableCases(data.units ?? []);
        } catch {
            try {
                const data = await listCasesAction();
                setAvailableCases(data.units ?? []);
            } catch {
                setAvailableCases([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [effectiveMonthYear]);

    useEffect(() => {
        refreshCases(effectiveMonthYear);
    }, [effectiveMonthYear, refreshCases]);

    const refreshCasesFromSolverOptions = async () => {
        setIsRefreshingOptions(true);

        try {
            const data = await refreshCasesFromSolverOptionsAction(effectiveMonthYear);
            setAvailableCases(data.units ?? []);
            router.refresh();
        } catch (error) {
            console.error('Failed to refresh cases from solver options', error);
        } finally {
            setIsRefreshingOptions(false);
        }
    };

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
        <div className="flex w-full max-w-[440px] flex-wrap items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
                <span className="text-sm text-muted-foreground">Monat:</span>

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

            <div className="flex shrink-0 items-center gap-2">
                {effectiveMonthYear && (
                    <DropdownMenu open={isCasesOpen} onOpenChange={setIsCasesOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-8 w-[128px] justify-between px-2 text-sm"
                                disabled={disabled || isLoading}
                            >
                                <span>Cases ({casesForSelectedMonth.length})</span>
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform ${isCasesOpen ? 'rotate-180' : ''}`}
                                />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" className="w-[128px] max-h-40 overflow-y-auto">
                            {casesForSelectedMonth.map(unit => (
                                <DropdownMenuCheckboxItem
                                    key={unit.unitId}
                                    checked={selectedCaseIds.includes(unit.unitId)}
                                    disabled={disabled || isLoading}
                                    onSelect={event => event.preventDefault()}
                                    onCheckedChange={() => toggleCaseId(unit.unitId)}
                                >
                                    Case {unit.unitId}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={disabled || isLoading || isRefreshingOptions || !effectiveMonthYear}
                    onClick={refreshCasesFromSolverOptions}
                    aria-label="Cases vom Backend aktualisieren"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshingOptions ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="hidden shrink-0">
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
