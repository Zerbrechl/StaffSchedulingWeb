import {createModule} from '@evyweb/ioctopus';
import {DI_SYMBOLS} from '@/di/types';
import {makeCreateAvailabilityUseCase} from '@/src/application/use-cases/availability/create-availability.use-case';
import {makeDeleteAvailabilityUseCase} from '@/src/application/use-cases/availability/delete-availability.use-case';
import {makeGetAllAvailabilityUseCase} from '@/src/application/use-cases/availability/get-all-availability.use-case';
import {makeGetAvailabilityByKeyUseCase} from '@/src/application/use-cases/availability/get-availability-by-key.use-case';
import {makeUpdateAvailabilityUseCase} from '@/src/application/use-cases/availability/update-availability.use-case';
import {makeCreateAvailabilityController} from '@/src/controllers/availability/create-availability.controller';
import {makeDeleteAvailabilityController} from '@/src/controllers/availability/delete-availability.controller';
import {makeGetAllAvailabilityController} from '@/src/controllers/availability/get-all-availability.controller';
import {makeGetAvailabilityByKeyController} from '@/src/controllers/availability/get-availability-by-key.controller';
import {makeUpdateAvailabilityController} from '@/src/controllers/availability/update-availability.controller';
import {LowdbAvailabilityRepository} from '@/src/infrastructure/repositories/lowdb-availability.repository';

export function createAvailabilityModule() {
    const m = createModule();

    m.bind(DI_SYMBOLS.IAvailabilityRepository).toClass(LowdbAvailabilityRepository, [], 'singleton');

    m.bind(DI_SYMBOLS.IGetAllAvailabilityUseCase).toHigherOrderFunction(makeGetAllAvailabilityUseCase, [DI_SYMBOLS.IAvailabilityRepository]);
    m.bind(DI_SYMBOLS.IGetAvailabilityByKeyUseCase).toHigherOrderFunction(makeGetAvailabilityByKeyUseCase, [DI_SYMBOLS.IAvailabilityRepository]);
    m.bind(DI_SYMBOLS.ICreateAvailabilityUseCase).toHigherOrderFunction(makeCreateAvailabilityUseCase, [DI_SYMBOLS.IAvailabilityRepository]);
    m.bind(DI_SYMBOLS.IUpdateAvailabilityUseCase).toHigherOrderFunction(makeUpdateAvailabilityUseCase, [DI_SYMBOLS.IAvailabilityRepository]);
    m.bind(DI_SYMBOLS.IDeleteAvailabilityUseCase).toHigherOrderFunction(makeDeleteAvailabilityUseCase, [DI_SYMBOLS.IAvailabilityRepository]);

    m.bind(DI_SYMBOLS.IGetAllAvailabilityController).toHigherOrderFunction(makeGetAllAvailabilityController, [DI_SYMBOLS.IGetAllAvailabilityUseCase]);
    m.bind(DI_SYMBOLS.IGetAvailabilityByKeyController).toHigherOrderFunction(makeGetAvailabilityByKeyController, [DI_SYMBOLS.IGetAvailabilityByKeyUseCase]);
    m.bind(DI_SYMBOLS.ICreateAvailabilityController).toHigherOrderFunction(makeCreateAvailabilityController, [DI_SYMBOLS.ICreateAvailabilityUseCase]);
    m.bind(DI_SYMBOLS.IUpdateAvailabilityController).toHigherOrderFunction(makeUpdateAvailabilityController, [DI_SYMBOLS.IUpdateAvailabilityUseCase]);
    m.bind(DI_SYMBOLS.IDeleteAvailabilityController).toHigherOrderFunction(makeDeleteAvailabilityController, [DI_SYMBOLS.IDeleteAvailabilityUseCase]);

    return m;
}
