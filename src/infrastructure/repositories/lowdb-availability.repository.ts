import {getDaysByWeekday} from '@/lib/services/global-to-current-wishes-converter';
import {IAvailabilityRepository} from '@/src/application/ports/availability.repository';
import {AvailabilityEmployee} from '@/src/entities/models/availability.model';
import {getAvailabilityDb} from '@/src/infrastructure/persistence/lowdb/availability.db';

export class LowdbAvailabilityRepository implements IAvailabilityRepository {
    async getAll(caseId: number, monthYear: string): Promise<AvailabilityEmployee[]> {
        const db = await getAvailabilityDb(caseId, monthYear);
        return db.data.employees;
    }

    async getByKey(caseId: number, monthYear: string, key: number): Promise<AvailabilityEmployee | null> {
        const db = await getAvailabilityDb(caseId, monthYear);
        return db.data.employees.find((e) => e.key === key) ?? null;
    }

    async create(caseId: number, monthYear: string, entry: AvailabilityEmployee): Promise<void> {
        const db = await getAvailabilityDb(caseId, monthYear);
        db.data.employees.push(entry);
        await db.write();
    }

    async update(caseId: number, monthYear: string, key: number, data: Partial<AvailabilityEmployee>): Promise<void> {
        const db = await getAvailabilityDb(caseId, monthYear);
        const index = db.data.employees.findIndex((e) => e.key === key);
        if (index !== -1) {
            db.data.employees[index] = {...db.data.employees[index], ...data};
            await db.write();
        }
    }

    async delete(caseId: number, monthYear: string, key: number): Promise<void> {
        const db = await getAvailabilityDb(caseId, monthYear);
        db.data.employees = db.data.employees.filter((e) => e.key !== key);
        await db.write();
    }

    async deleteAll(caseId: number, monthYear: string): Promise<void> {
        const db = await getAvailabilityDb(caseId, monthYear);
        db.data.employees = [];
        await db.write();
    }

    async generateFromGlobal(caseId: number, monthYear: string, globalEntry: AvailabilityEmployee): Promise<void> {
        const [monthStr, yearStr] = monthYear.split('_');
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
        const daysByWeekday = getDaysByWeekday(year, month);
        const days = new Set<number>();

        globalEntry.availability_days.forEach((weekday) => {
            if (weekday >= 1 && weekday <= 7) {
                daysByWeekday[weekday - 1].forEach(day => days.add(day));
            }
        });

        const monthlyEntry: AvailabilityEmployee = {
            key: globalEntry.key,
            firstname: globalEntry.firstname,
            name: globalEntry.name,
            availability_days: Array.from(days).sort((a, b) => a - b),
        };

        const db = await getAvailabilityDb(caseId, monthYear);
        const index = db.data.employees.findIndex((e) => e.key === globalEntry.key);
        if (index === -1) {
            db.data.employees.push(monthlyEntry);
        } else {
            db.data.employees[index] = monthlyEntry;
        }
        await db.write();
    }
}
