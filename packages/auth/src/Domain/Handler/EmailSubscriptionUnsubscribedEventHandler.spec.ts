import { EmailLevel } from '@standardnotes/domain-core'
import { EmailSubscriptionUnsubscribedEvent } from '@standardnotes/domain-events'

import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { EmailSubscriptionUnsubscribedEventHandler } from './EmailSubscriptionUnsubscribedEventHandler'

describe('EmailSubscriptionUnsubscribedEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let settingsService: SettingServiceInterface
  let event: EmailSubscriptionUnsubscribedEvent

  const createHandler = () => new EmailSubscriptionUnsubscribedEventHandler(userRepository, settingsService)

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue({} as jest.Mocked<User>)

    settingsService = {} as jest.Mocked<SettingServiceInterface>
    settingsService.createOrReplace = jest.fn()

    event = {
      payload: {
        userEmail: 'test@test.te',
        level: EmailLevel.LEVELS.Marketing,
      },
    } as jest.Mocked<EmailSubscriptionUnsubscribedEvent>
  })

  it('should not do anything if username is invalid', async () => {
    event.payload.userEmail = ''

    await createHandler().handle(event)

    expect(settingsService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should not do anything if user is not found', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(settingsService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should update user marketing email settings', async () => {
    await createHandler().handle(event)

    expect(settingsService.createOrReplace).toHaveBeenCalledWith({
      user: {},
      props: {
        name: 'MUTE_MARKETING_EMAILS',
        unencryptedValue: 'muted',
        sensitive: false,
      },
    })
  })

  it('should update user sign in email settings', async () => {
    event.payload.level = EmailLevel.LEVELS.SignIn

    await createHandler().handle(event)

    expect(settingsService.createOrReplace).toHaveBeenCalledWith({
      user: {},
      props: {
        name: 'MUTE_SIGN_IN_EMAILS',
        unencryptedValue: 'muted',
        sensitive: false,
      },
    })
  })

  it('should update user email backup email settings', async () => {
    event.payload.level = EmailLevel.LEVELS.FailedEmailBackup

    await createHandler().handle(event)

    expect(settingsService.createOrReplace).toHaveBeenCalledWith({
      user: {},
      props: {
        name: 'MUTE_FAILED_BACKUPS_EMAILS',
        unencryptedValue: 'muted',
        sensitive: false,
      },
    })
  })

  it('should update user email backup email settings', async () => {
    event.payload.level = EmailLevel.LEVELS.FailedCloudBackup

    await createHandler().handle(event)

    expect(settingsService.createOrReplace).toHaveBeenCalledWith({
      user: {},
      props: {
        name: 'MUTE_FAILED_CLOUD_BACKUPS_EMAILS',
        unencryptedValue: 'muted',
        sensitive: false,
      },
    })
  })

  it('should throw error for unrecognized level', async () => {
    event.payload.level = 'foobar'

    let caughtError = null
    try {
      await createHandler().handle(event)
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).not.toBeNull()
  })
})
