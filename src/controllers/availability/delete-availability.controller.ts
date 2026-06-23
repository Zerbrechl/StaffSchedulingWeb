import type {IDeleteAvailabilityUseCase} from '@/src/application/use-cases/availability/delete-availability.use-case';
import {isDomainError} from '@/src/entities/errors/base.errors';
import {validateMonthYear} from '@/src/entities/validation/input-validators';

export interface IDeleteAvailabilityController {
    (input: { caseId: number; monthYear: string; key: number }): Promise<
        { data: void } | { error: string }
    >;
}

export function makeDeleteAvailabilityController(
    deleteAvailabilityUseCase: IDeleteAvailabilityUseCase
): IDeleteAvailabilityController {
    return async ({caseId, monthYear, key}) => {
        try {
            validateMonthYear(monthYear);
            await deleteAvailabilityUseCase({caseId, monthYear, key});
            return {data: undefined};
        } catch (error) {
            if (isDomainError(error)) return {error: error.message};
            throw error;
        }
    };
}
