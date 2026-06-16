import {EmployeesPageClient} from './employees-page-client';
import {listCasesAction} from '@/features/cases/cases.actions';
import {getAllEmployeesAction} from '@/features/employees/employees.actions';
import {Employee} from '@/src/entities/models/employee.model';
import {CaseUnit} from '@/src/entities/models/case.model';

interface EmployeeCaseData {
    caseId: number;
    employees: Employee[];
}

interface EmployeeCaseError {
    caseId: number;
    error: string;
}

type EmployeeResult =
    | { caseId: number; employees: Employee[]; error: null }
    | { caseId: number; employees: Employee[]; error: string };

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export default async function EmployeesPage({
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

    if (!monthYear) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">Bitte wähle einen Monat
            aus</div>;
    }

    if (!/^(0?[1-9]|1[0-2])_\d{4}$/.test(monthYear)) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">Bitte wähle einen Monat
            und mindestens einen Case aus</div>;
    }

    const {units} = await listCasesAction();
    const availableCaseIds = units
        .filter((unit: CaseUnit) => unit.months.includes(monthYear))
        .map(unit => unit.unitId);

    const employeeResults: EmployeeResult[] = await Promise.all(
        caseIds.map(async caseId => {
            try {
                return {
                    caseId,
                    employees: await getAllEmployeesAction(caseId, monthYear),
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

    const employeeCases: EmployeeCaseData[] = employeeResults
        .filter(result => result.error === null)
        .map(({caseId, employees}) => ({caseId, employees}));

    const employeeErrors: EmployeeCaseError[] = employeeResults
        .filter((result): result is { caseId: number; employees: Employee[]; error: string } => result.error !== null)
        .map(({caseId, error}) => ({caseId, error}));

    return (
        <EmployeesPageClient
            employeeCases={employeeCases}
            employeeErrors={employeeErrors}
            availableCaseIds={availableCaseIds}
        />
    );
}
