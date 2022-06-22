import 'reflect-metadata'
import { ListedAccountCreatedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { ListedAccountCreatedEventHandler } from './ListedAccountCreatedEventHandler'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { User } from '../User/User'
import { Setting } from '../Setting/Setting'

describe('ListedAccountCreatedEventHandler', () => {
  let settingService: SettingServiceInterface
  let userRepository: UserRepositoryInterface
  let event: ListedAccountCreatedEvent
  let user: User
  let logger: Logger

  const createHandler = () => new ListedAccountCreatedEventHandler(userRepository, settingService, logger)

  beforeEach(() => {
    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(null)
    settingService.createOrReplace = jest.fn()

    event = {} as jest.Mocked<ListedAccountCreatedEvent>
    event.payload = {
      userEmail: 'test@test.com',
      userId: 1,
      userName: 'testuser',
      secret: 'new-secret',
      hostUrl: 'https://dev.listed.to',
    }

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()
  })

  it('should not save the listed secret if user is not found', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(settingService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should save the listed secret as a user setting', async () => {
    await createHandler().handle(event)

    expect(settingService.createOrReplace).toHaveBeenCalledWith({
      user,
      props: {
        name: 'LISTED_AUTHOR_SECRETS',
        sensitive: false,
        unencryptedValue: '[{"authorId":1,"secret":"new-secret","hostUrl":"https://dev.listed.to"}]',
      },
    })
  })

  it('should add the listed secret as a user setting to an existing list of secrets', async () => {
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: '[{"authorId":2,"secret":"old-secret","hostUrl":"https://dev.listed.to"}]',
    } as jest.Mocked<Setting>)

    await createHandler().handle(event)

    expect(settingService.createOrReplace).toHaveBeenCalledWith({
      user,
      props: {
        name: 'LISTED_AUTHOR_SECRETS',
        sensitive: false,
        unencryptedValue:
          '[{"authorId":2,"secret":"old-secret","hostUrl":"https://dev.listed.to"},{"authorId":1,"secret":"new-secret","hostUrl":"https://dev.listed.to"}]',
      },
    })
  })
})
