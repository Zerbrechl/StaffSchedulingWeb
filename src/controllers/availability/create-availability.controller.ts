import type {ICreateAvailabilityUseCase} from '@/src/application/use-cases/availability/create-availability.use-case';
import {isDomainError} from '@/src/entities/errors/base.errors';
import type {AvailabilityEmployee} from '@/src/entities/models/availability.model';
import {validateMonthYear} from '@/src/entities/validation/input-validators';

export interface ICreateAvailabilityController {
    (input: { caseId: number; monthYear: string; entry: AvailabilityEmployee }): Promise<
        { data: void } | { error: string }
    >;
}

export function makeCreateAvailabilityController(
    createAvailabilityUseCase: ICreateAvailabilityUseCase
): ICreateAvailabilityController {
    return async ({caseId, monthYear, entry}) => {
        try {
            validateMonthYear(monthYear);
            await createAvailabilityUseCase({caseId, monthYear, entry});
            return {data: undefined};
        } catch (error) {
            if (isDomainError(error)) return {error: error.message};
            throw error;
        }
    };
}
