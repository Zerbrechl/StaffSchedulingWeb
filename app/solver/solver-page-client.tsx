'use client';

import {useMemo, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {ConfigValidator} from '@/features/solver/components/config-validator';
import {SolverControlPanel} from '@/features/solver/components/solver-control-panel';
import {JobHistoryTable} from '@/features/solver/components/job-history-table';
import {getJobs} from '@/features/solver/solver.actions';
import type {SolverJob} from '@/src/entities/models/solver.model';
import type {SolverHealthResult} from '@/src/application/ports/solver.service';
import type {ScheduleSolutionRaw} from '@/src/entities/models/schedule.model';

interface SolverPageClientProps {
    caseId: number | null;
    monthYear: string;
    availableCaseIds: number[];
    initialConfigValidation: SolverHealthResult | null;
    initialJobs: SolverJob[];
    initialLastInsertedSolution: ScheduleSolutionRaw | null;
    initialPendingInsertSolution: ScheduleSolutionRaw | null;
    isLocked?: boolean;
}

export function SolverPageClient({
                                     caseId,
                                     monthYear,
                                     availableCaseIds,
                                     initialConfigValidation,
                                     initialJobs,
                                     initialLastInsertedSolution,
                                     initialPendingInsertSolution,
                                     isLocked,
                                 }: SolverPageClientProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [jobs, setJobs] = useState<SolverJob[]>(initialJobs);

    const visibleCaseIds = useMemo(() => {
        const caseIdsParam =
            searchParams.get('caseIds') ?? searchParams.get('caseId') ?? '';

        return Array.from(
            new Set(
                caseIdsParam
                    .split(',')
                    .map(Number)
                    .filter(id => Number.isInteger(id) && id > 0)
            )
        );
    }, [searchParams]);

    const selectedAvailableCaseIds = useMemo(
        () => visibleCaseIds.filter(id => availableCaseIds.includes(id)),
        [availableCaseIds, visibleCaseIds]
    );

    const toggleCase = (selectedCaseId: number) => {
        const nextCaseIds = visibleCaseIds.includes(selectedCaseId)
            ? visibleCaseIds.filter(id => id !== selectedCaseId)
            : [...visibleCaseIds, selectedCaseId];

        const params = new URLSearchParams(searchParams.toString());

        if (nextCaseIds.length > 0) {
            params.set('caseIds', nextCaseIds.join(','));
            params.set('caseId', String(nextCaseIds[0]));
        } else {
            params.delete('caseIds');
            params.delete('caseId');
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    const refreshJobs = async () => {
        if (!caseId) return;

        try {
            const data = await getJobs(caseId, monthYear);
            setJobs(data.jobs);
        } catch {
            setJobs([]);
        }
    };

    return (
        <div className="space-y-6 py-6">
            <div>
                <h1 className="text-3xl font-bold">Solver</h1>
                <p className="text-muted-foreground mt-2">
                    Steuern Sie den Python-Solver zur automatischen Dienstplanerstellung
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {availableCaseIds.map(availableCaseId => {
                    const active = selectedAvailableCaseIds.includes(availableCaseId);

                    return (
                        <Button
                            key={availableCaseId}
                            type="button"
                            size="sm"
                            variant={active ? 'default' : 'outline'}
                            onClick={() => toggleCase(availableCaseId)}
                            disabled={isLocked}
                        >
                            Case {availableCaseId}
                        </Button>
                    );
                })}
            </div>

            <ConfigValidator initialData={initialConfigValidation} />

            {!caseId ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Bitte wähle mindestens einen Case aus
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SolverControlPanel
                        caseId={caseId}
                        selectedCaseIds={selectedAvailableCaseIds}
                        monthYear={monthYear}
                        onAfterOperation={refreshJobs}
                        initialLastInsertedSolution={initialLastInsertedSolution}
                        initialPendingInsertSolution={initialPendingInsertSolution}
                        isLocked={isLocked}
                    />

                    <div className="space-y-6">
                        <JobHistoryTable jobs={jobs} />
                    </div>
                </div>
            )}
        </div>
    );
}
