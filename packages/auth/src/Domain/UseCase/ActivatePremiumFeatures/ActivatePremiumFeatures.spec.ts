import { TimerInterface } from '@standardnotes/time'
import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { ActivatePremiumFeatures } from './ActivatePremiumFeatures'
import { User } from '../../User/User'

describe('ActivatePremiumFeatures', () => {
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let roleService: RoleServiceInterface
  let timer: TimerInterface
  let user: User

  const createUseCase = () =>
    new ActivatePremiumFeatures(userRepository, userSubscriptionRepository, roleService, timer)

  beforeEach(() => {
    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockResolvedValue(user)

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.save = jest.fn()

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addUserRole = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123456789)
    timer.convertDateToMicroseconds = jest.fn().mockReturnValue(123456789)
    timer.getUTCDateNDaysAhead = jest.fn().mockReturnValue(new Date('2024-01-01T00:00:00.000Z'))
  })

  it('should return error when username is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ username: '' })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Username cannot be empty')
  })

  it('should return error when user is not found', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({ username: 'test@test.te' })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('User not found with username: test@test.te')
  })

  it('should save a subscription and add role to user', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ username: 'test@test.te' })

    expect(result.isFailed()).toBe(false)

    expect(userSubscriptionRepository.save).toHaveBeenCalled()
    expect(roleService.addUserRole).toHaveBeenCalled()
  })
})
