import type {IDeleteGlobalAvailabilityUseCase} from '@/src/application/use-cases/global-availability/delete-global-availability.use-case';
import {isDomainError} from '@/src/entities/errors/base.errors';
import {validateMonthYear} from '@/src/entities/validation/input-validators';

export interface IDeleteGlobalAvailabilityController {
    (input: { caseId: number; monthYear: string; key: number }): Promise<
        { data: void } | { error: string }
    >;
}

export function makeDeleteGlobalAvailabilityController(
    deleteGlobalAvailabilityUseCase: IDeleteGlobalAvailabilityUseCase
): IDeleteGlobalAvailabilityController {
    return async ({caseId, monthYear, key}) => {
        try {
            validateMonthYear(monthYear);
            await deleteGlobalAvailabilityUseCase({caseId, monthYear, key});
            return {data: undefined};
        } catch (error) {
            if (isDomainError(error)) return {error: error.message};
            throw error;
        }
    };
}
