import 'reflect-metadata'
import { ListedAccountDeletedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { ListedAccountDeletedEventHandler } from './ListedAccountDeletedEventHandler'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { User } from '../User/User'
import { Setting } from '../Setting/Setting'

describe('ListedAccountDeletedEventHandler', () => {
  let settingService: SettingServiceInterface
  let userRepository: UserRepositoryInterface
  let event: ListedAccountDeletedEvent
  let user: User
  let logger: Logger

  const createHandler = () => new ListedAccountDeletedEventHandler(userRepository, settingService, logger)

  beforeEach(() => {
    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: '[{"authorId":1,"secret":"my-secret","hostUrl":"https://dev.listed.to"}]',
    } as jest.Mocked<Setting>)
    settingService.createOrReplace = jest.fn()

    event = {} as jest.Mocked<ListedAccountDeletedEvent>
    event.payload = {
      userEmail: 'test@test.com',
      userId: 1,
      userName: 'testuser',
      secret: 'my-secret',
      hostUrl: 'https://dev.listed.to',
    }

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()
  })

  it('should not remove the listed secret if user is not found', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(settingService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should not remove the listed secret if setting is not found', async () => {
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(settingService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should remove the listed secret from the user setting', async () => {
    await createHandler().handle(event)

    expect(settingService.createOrReplace).toHaveBeenCalledWith({
      user,
      props: {
        name: 'LISTED_AUTHOR_SECRETS',
        sensitive: false,
        unencryptedValue: '[]',
      },
    })
  })

  it('should remove the listed secret from an existing list of secrets', async () => {
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value:
        '[{"authorId":2,"secret":"old-secret","hostUrl":"https://dev.listed.to"},{"authorId":1,"secret":"my-secret","hostUrl":"https://dev.listed.to"},{"authorId":1,"secret":"my-secret","hostUrl":"https://local.listed.to"}]',
    } as jest.Mocked<Setting>)

    await createHandler().handle(event)

    expect(settingService.createOrReplace).toHaveBeenCalledWith({
      user,
      props: {
        name: 'LISTED_AUTHOR_SECRETS',
        sensitive: false,
        unencryptedValue:
          '[{"authorId":2,"secret":"old-secret","hostUrl":"https://dev.listed.to"},{"authorId":1,"secret":"my-secret","hostUrl":"https://local.listed.to"}]',
      },
    })
  })
})
