import type {IGetAvailabilityByKeyUseCase} from '@/src/application/use-cases/availability/get-availability-by-key.use-case';
import {isDomainError} from '@/src/entities/errors/base.errors';
import type {AvailabilityEmployee} from '@/src/entities/models/availability.model';
import {validateMonthYear} from '@/src/entities/validation/input-validators';

export interface IGetAvailabilityByKeyController {
    (input: { caseId: number; monthYear: string; key: number }): Promise<
        { data: AvailabilityEmployee } | { error: string }
    >;
}

export function makeGetAvailabilityByKeyController(
    getAvailabilityByKeyUseCase: IGetAvailabilityByKeyUseCase
): IGetAvailabilityByKeyController {
    return async ({caseId, monthYear, key}) => {
        try {
            validateMonthYear(monthYear);
            const availability = await getAvailabilityByKeyUseCase({caseId, monthYear, key});
            return {data: availability};
        } catch (error) {
            if (isDomainError(error)) return {error: error.message};
            throw error;
        }
    };
}
