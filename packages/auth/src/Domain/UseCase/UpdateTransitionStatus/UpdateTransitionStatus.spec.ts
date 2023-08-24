import { RoleName, Uuid } from '@standardnotes/domain-core'

import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { TransitionStatusRepositoryInterface } from '../../Transition/TransitionStatusRepositoryInterface'
import { UpdateTransitionStatus } from './UpdateTransitionStatus'

describe('UpdateTransitionStatus', () => {
  let transitionStatusRepository: TransitionStatusRepositoryInterface
  let roleService: RoleServiceInterface

  const createUseCase = () => new UpdateTransitionStatus(transitionStatusRepository, roleService)

  beforeEach(() => {
    transitionStatusRepository = {} as jest.Mocked<TransitionStatusRepositoryInterface>
    transitionStatusRepository.removeStatus = jest.fn()
    transitionStatusRepository.updateStatus = jest.fn()

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addRoleToUser = jest.fn()
  })

  it('should remove transition status and add TransitionUser role', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      status: 'FINISHED',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(transitionStatusRepository.removeStatus).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000000')
    expect(roleService.addRoleToUser).toHaveBeenCalledWith(
      Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      RoleName.create(RoleName.NAMES.TransitionUser).getValue(),
    )
  })

  it('should update transition status', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      status: 'STARTED',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(transitionStatusRepository.updateStatus).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000000',
      'STARTED',
    )
  })

  it('should return error when user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      status: 'STARTED',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Given value is not a valid uuid: invalid')
  })
})
