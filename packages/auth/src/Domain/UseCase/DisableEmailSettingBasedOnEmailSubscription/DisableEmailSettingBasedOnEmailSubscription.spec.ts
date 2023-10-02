import { EmailLevel } from '@standardnotes/domain-core'
import { Setting } from '../../Setting/Setting'
import { SettingFactoryInterface } from '../../Setting/SettingFactoryInterface'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { DisableEmailSettingBasedOnEmailSubscription } from './DisableEmailSettingBasedOnEmailSubscription'

describe('DisableEmailSettingBasedOnEmailSubscription', () => {
  let userRepository: UserRepositoryInterface
  let settingRepository: SettingRepositoryInterface
  let factory: SettingFactoryInterface
  let user: User

  const createUseCase = () =>
    new DisableEmailSettingBasedOnEmailSubscription(userRepository, settingRepository, factory)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = 'userUuid'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockResolvedValue(user)

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockResolvedValue({} as jest.Mocked<Setting>)
    settingRepository.save = jest.fn()

    factory = {} as jest.Mocked<SettingFactoryInterface>
    factory.create = jest.fn().mockResolvedValue({} as jest.Mocked<Setting>)
    factory.createReplacement = jest.fn().mockResolvedValue({} as jest.Mocked<Setting>)
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

  it('should create a new setting if it does not exist', async () => {
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
      level: EmailLevel.LEVELS.Marketing,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(factory.create).toHaveBeenCalled()
    expect(factory.createReplacement).not.toHaveBeenCalled()
  })

  it('should replace the setting if it exists', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userEmail: 'test@test.te',
      level: EmailLevel.LEVELS.Marketing,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(factory.create).not.toHaveBeenCalled()
    expect(factory.createReplacement).toHaveBeenCalled()
  })
})
