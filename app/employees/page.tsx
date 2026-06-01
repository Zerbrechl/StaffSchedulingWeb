import {EmployeesPageClient} from './employees-page-client';
import {listCasesAction} from '@/features/cases/cases.actions';
import {getAllEmployeesAction} from '@/features/employees/employees.actions';
import {Employee} from '@/src/entities/models/employee.model';
import {CaseUnit} from '@/src/entities/models/case.model';

interface EmployeeCaseData {
    caseId: number;
    employees: Employee[];
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

    const employeeCases: EmployeeCaseData[] = await Promise.all(
        caseIds.map(async caseId => ({
            caseId,
            employees: await getAllEmployeesAction(caseId, monthYear),
        }))
    );

    return <EmployeesPageClient employeeCases={employeeCases} availableCaseIds={availableCaseIds}/>;
}
