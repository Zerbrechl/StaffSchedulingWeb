import {AvailabilityPageClient} from './availability-page-client';
import {getAllAvailabilityAction} from '@/features/availability/availability.actions';
import {listCasesAction} from '@/features/cases/cases.actions';
import type {AvailabilityEmployee} from '@/src/entities/models/availability.model';
import type {CaseUnit} from '@/src/entities/models/case.model';

interface AvailabilityCaseData {
    caseId: number;
    employees: AvailabilityEmployee[];
}

interface AvailabilityCaseError {
    caseId: number;
    error: string;
}

type AvailabilityResult =
    | { caseId: number; employees: AvailabilityEmployee[]; error: null }
    | { caseId: number; employees: AvailabilityEmployee[]; error: string };

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export default async function AvailabilityPage({
                                                   searchParams,
                                               }: {
    searchParams: Promise<{ caseId?: string; caseIds?: string; monthYear?: string }>;
}) {
    const {caseId: caseIdStr, caseIds: caseIdsStr, monthYear} = await searchParams;
    const rawCaseIds = caseIdsStr ?? caseIdStr ?? '';
    const caseIds = Array.from(
        new Set(
            rawCaseIds
                .split(',')
                .map(id => Number(id))
                .filter(id => Number.isInteger(id) && id > 0)
        )
    );

    if (!monthYear || !/^(0?[1-9]|1[0-2])_\d{4}$/.test(monthYear)) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">Bitte wähle einen Monat aus</div>;
    }

    const {units} = await listCasesAction();
    const availableCaseIds = units
        .filter((unit: CaseUnit) => unit.months.includes(monthYear))
        .map(unit => unit.unitId);

    const results: AvailabilityResult[] = await Promise.all(
        caseIds.map(async caseId => {
            try {
                return {
                    caseId,
                    employees: await getAllAvailabilityAction(caseId, monthYear),
                    error: null,
                };
            } catch (error) {
                return {
                    caseId,
                    employees: [],
                    error: getErrorMessage(error),
                };
            }
        })
    );

    const availabilityCases: AvailabilityCaseData[] = results
        .filter(result => result.error === null)
        .map(({caseId, employees}) => ({caseId, employees}));

    const availabilityErrors: AvailabilityCaseError[] = results
        .filter((result): result is { caseId: number; employees: AvailabilityEmployee[]; error: string } => result.error !== null)
        .map(({caseId, error}) => ({caseId, error}));

    return (
        <AvailabilityPageClient
            monthYear={monthYear}
            availabilityCases={availabilityCases}
            availabilityErrors={availabilityErrors}
            availableCaseIds={availableCaseIds}
        />
    );
}
