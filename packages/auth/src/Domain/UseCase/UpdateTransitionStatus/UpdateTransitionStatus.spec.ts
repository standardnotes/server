import { RoleName, Uuid } from '@standardnotes/domain-core'

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
    transitionStatusRepository.removeStatus = jest.fn()
    transitionStatusRepository.updateStatus = jest.fn()
    transitionStatusRepository.getStatuses = jest.fn().mockResolvedValue([
      {
        userUuid: '00000000-0000-0000-0000-000000000000',
        status: 'STARTED',
      },
      {
        userUuid: '00000000-0000-0000-0000-000000000001',
        status: 'IN_PROGRESS',
      },
      {
        userUuid: '00000000-0000-0000-0000-000000000002',
        status: 'FAILED',
      },
    ])

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addRoleToUser = jest.fn()
  })

  it('should remove transition status and add TransitionUser role', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      status: 'FINISHED',
      transitionType: 'items',
      transitionTimestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(transitionStatusRepository.removeStatus).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000000',
      'items',
    )
    expect(roleService.addRoleToUser).toHaveBeenCalledWith(
      Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      RoleName.create(RoleName.NAMES.TransitionUser).getValue(),
    )
  })

  it('should remove transition status', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      status: 'FINISHED',
      transitionType: 'revisions',
      transitionTimestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(transitionStatusRepository.removeStatus).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000000',
      'revisions',
    )
    expect(roleService.addRoleToUser).not.toHaveBeenCalled()
  })

  it('should update transition status', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      status: 'STARTED',
      transitionType: 'items',
      transitionTimestamp: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(transitionStatusRepository.updateStatus).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000000',
      'items',
      'STARTED',
    )
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
})
