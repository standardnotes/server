import { EmailLevel, Result } from '@standardnotes/domain-core'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { DisableEmailSettingBasedOnEmailSubscription } from './DisableEmailSettingBasedOnEmailSubscription'
import { SetSettingValue } from '../SetSettingValue/SetSettingValue'
import { SetSubscriptionSettingValue } from '../SetSubscriptionSettingValue/SetSubscriptionSettingValue'
import { GetSharedOrRegularSubscriptionForUser } from '../GetSharedOrRegularSubscriptionForUser/GetSharedOrRegularSubscriptionForUser'
import { UserSubscription } from '../../Subscription/UserSubscription'

describe('DisableEmailSettingBasedOnEmailSubscription', () => {
  let userRepository: UserRepositoryInterface
  let setSettingValue: SetSettingValue
  let setSubscriptionSetting: SetSubscriptionSettingValue
  let getSharedOrRegularSubscriptionForUser: GetSharedOrRegularSubscriptionForUser
  let regularSubscription: UserSubscription

  let user: User

  const createUseCase = () =>
    new DisableEmailSettingBasedOnEmailSubscription(
      userRepository,
      setSettingValue,
      setSubscriptionSetting,
      getSharedOrRegularSubscriptionForUser,
    )

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = 'userUuid'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockResolvedValue(user)

    setSettingValue = {} as jest.Mocked<SetSettingValue>
    setSettingValue.execute = jest.fn().mockReturnValue(Result.ok())

    setSubscriptionSetting = {} as jest.Mocked<SetSubscriptionSettingValue>
    setSubscriptionSetting.execute = jest.fn().mockResolvedValue(Result.ok())

    regularSubscription = {} as jest.Mocked<UserSubscription>

    getSharedOrRegularSubscriptionForUser = {} as jest.Mocked<GetSharedOrRegularSubscriptionForUser>
    getSharedOrRegularSubscriptionForUser.execute = jest.fn().mockResolvedValue(Result.ok(regularSubscription))
  })

  it('should set the setting value when muting non subscription setting value', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
      level: EmailLevel.LEVELS.Marketing,
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should set the subscription setting value when muting a subscription setting value', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
      level: EmailLevel.LEVELS.SignIn,
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should return error if subscription could not be found', async () => {
    getSharedOrRegularSubscriptionForUser.execute = jest.fn().mockResolvedValue(Result.fail('error'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
      level: EmailLevel.LEVELS.SignIn,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if the username is empty', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: '',
      level: EmailLevel.LEVELS.Marketing,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if the user is not found', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
      level: EmailLevel.LEVELS.Marketing,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if the setting name cannot be determined', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
      level: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
