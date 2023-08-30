import { RoleName } from '@standardnotes/domain-core'
import { Role } from '../../Role/Role'
import { TransitionStatusRepositoryInterface } from '../../Transition/TransitionStatusRepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetTransitionStatus } from './GetTransitionStatus'

describe('GetTransitionStatus', () => {
  let transitionStatusRepository: TransitionStatusRepositoryInterface
  let userRepository: UserRepositoryInterface
  let user: User
  let role: Role

  const createUseCase = () => new GetTransitionStatus(transitionStatusRepository, userRepository)

  beforeEach(() => {
    transitionStatusRepository = {} as jest.Mocked<TransitionStatusRepositoryInterface>
    transitionStatusRepository.getStatus = jest.fn().mockReturnValue(null)

    role = {} as jest.Mocked<Role>
    role.name = RoleName.NAMES.CoreUser

    user = {
      uuid: '00000000-0000-0000-0000-000000000000',
      email: 'test@test.te',
    } as jest.Mocked<User>
    user.roles = Promise.resolve([role])

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)
  })

  it('returns transition status FINISHED', async () => {
    role.name = RoleName.NAMES.TransitionUser
    user.roles = Promise.resolve([role])
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      transitionType: 'items',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()).toEqual('FINISHED')
  })

  it('returns transition status STARTED', async () => {
    const useCase = createUseCase()

    transitionStatusRepository.getStatus = jest.fn().mockReturnValue('STARTED')

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      transitionType: 'items',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()).toEqual('STARTED')
  })

  it('returns transition status TO-DO', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      transitionType: 'items',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()).toEqual('TO-DO')
  })

  it('returns transition status FAILED', async () => {
    const useCase = createUseCase()

    transitionStatusRepository.getStatus = jest.fn().mockReturnValue('FAILED')

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      transitionType: 'items',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()).toEqual('FAILED')
  })

  it('return error if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      transitionType: 'items',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Given value is not a valid uuid: invalid')
  })

  it('return error if user not found', async () => {
    const useCase = createUseCase()

    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      transitionType: 'items',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('User not found.')
  })
})
