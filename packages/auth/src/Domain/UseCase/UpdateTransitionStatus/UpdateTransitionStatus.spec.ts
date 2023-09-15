import { RoleName, TransitionStatus, Uuid } from '@standardnotes/domain-core'

import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { TransitionStatusRepositoryInterface } from '../../Transition/TransitionStatusRepositoryInterface'
import { UpdateTransitionStatus } from './UpdateTransitionStatus'
import { Logger } from 'winston'

describe('UpdateTransitionStatus', () => {
  let transitionStatusRepository: TransitionStatusRepositoryInterface
  let roleService: RoleServiceInterface
  let logger: Logger

  const createUseCase = () => new UpdateTransitionStatus(transitionStatusRepository, roleService, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()

    transitionStatusRepository = {} as jest.Mocked<TransitionStatusRepositoryInterface>
    transitionStatusRepository.updateStatus = jest.fn()
    transitionStatusRepository.getStatus = jest.fn().mockResolvedValue(null)

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addRoleToUser = jest.fn()
  })

  it('should add TRANSITION_USER role', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      status: 'VERIFIED',
      transitionType: 'items',
      transitionTimestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(roleService.addRoleToUser).toHaveBeenCalledWith(
      Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      RoleName.create(RoleName.NAMES.TransitionUser).getValue(),
    )
  })

  it('should update transition status', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      status: TransitionStatus.STATUSES.InProgress,
      transitionType: 'items',
      transitionTimestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(transitionStatusRepository.updateStatus).toHaveBeenCalled()
  })

  it('should return error when user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      status: 'STARTED',
      transitionType: 'items',
      transitionTimestamp: 123,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Given value is not a valid uuid: invalid')
  })

  it('should not update status if transition is already verified', async () => {
    transitionStatusRepository.getStatus = jest
      .fn()
      .mockResolvedValue(TransitionStatus.create(TransitionStatus.STATUSES.Verified).getValue())

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      status: TransitionStatus.STATUSES.InProgress,
      transitionType: 'items',
      transitionTimestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(transitionStatusRepository.updateStatus).not.toHaveBeenCalled()
  })

  it('should not update status if transition is already failed', async () => {
    transitionStatusRepository.getStatus = jest
      .fn()
      .mockResolvedValue(TransitionStatus.create(TransitionStatus.STATUSES.Failed).getValue())

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      status: TransitionStatus.STATUSES.InProgress,
      transitionType: 'items',
      transitionTimestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(transitionStatusRepository.updateStatus).not.toHaveBeenCalled()
  })
})
