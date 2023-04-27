import {
  DomainEventPublisherInterface,
  EmailBackupRequestedEvent,
  MuteEmailsSettingChangedEvent,
  UserDisabledSessionUserAgentLoggingEvent,
} from '@standardnotes/domain-events'
import {
  EmailBackupFrequency,
  LogSessionUserAgentOption,
  MuteMarketingEmailsOption,
  SettingName,
} from '@standardnotes/settings'
import 'reflect-metadata'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { User } from '../User/User'
import { Setting } from './Setting'
import { SettingDecrypterInterface } from './SettingDecrypterInterface'

import { SettingInterpreter } from './SettingInterpreter'
import { SettingRepositoryInterface } from './SettingRepositoryInterface'

describe('SettingInterpreter', () => {
  let user: User
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let settingRepository: SettingRepositoryInterface
  let settingDecrypter: SettingDecrypterInterface
  let logger: Logger

  const createInterpreter = () => new SettingInterpreter(domainEventPublisher, domainEventFactory, settingRepository)

  beforeEach(() => {
    user = {
      uuid: '4-5-6',
      email: 'test@test.te',
    } as jest.Mocked<User>

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(null)
    settingRepository.findOneByNameAndUserUuid = jest.fn().mockReturnValue(null)

    settingDecrypter = {} as jest.Mocked<SettingDecrypterInterface>
    settingDecrypter.decryptSettingValue = jest.fn().mockReturnValue('decrypted')

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createEmailBackupRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<EmailBackupRequestedEvent>)
    domainEventFactory.createUserDisabledSessionUserAgentLoggingEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<UserDisabledSessionUserAgentLoggingEvent>)
    domainEventFactory.createMuteEmailsSettingChangedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<MuteEmailsSettingChangedEvent>)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  it('should trigger session cleanup if user is disabling session user agent logging', async () => {
    await createInterpreter().interpretSettingUpdated(
      SettingName.NAMES.LogSessionUserAgent,
      user,
      LogSessionUserAgentOption.Disabled,
    )

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createUserDisabledSessionUserAgentLoggingEvent).toHaveBeenCalledWith({
      userUuid: '4-5-6',
      email: 'test@test.te',
    })
  })

  it('should trigger backup if email backup setting is created - emails not muted', async () => {
    await createInterpreter().interpretSettingUpdated(
      SettingName.NAMES.EmailBackupFrequency,
      user,
      EmailBackupFrequency.Daily,
    )

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailBackupRequestedEvent).toHaveBeenCalledWith('4-5-6', '', false)
  })

  it('should trigger backup if email backup setting is created - emails muted', async () => {
    settingRepository.findOneByNameAndUserUuid = jest.fn().mockReturnValue({
      name: SettingName.NAMES.MuteFailedBackupsEmails,
      uuid: '6-7-8',
      value: 'muted',
    } as jest.Mocked<Setting>)

    await createInterpreter().interpretSettingUpdated(
      SettingName.NAMES.EmailBackupFrequency,
      user,
      EmailBackupFrequency.Daily,
    )

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailBackupRequestedEvent).toHaveBeenCalledWith('4-5-6', '6-7-8', true)
  })

  it('should not trigger backup if email backup setting is disabled', async () => {
    settingRepository.findOneByNameAndUserUuid = jest.fn().mockReturnValue(null)

    await createInterpreter().interpretSettingUpdated(
      SettingName.NAMES.EmailBackupFrequency,
      user,
      EmailBackupFrequency.Disabled,
    )

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(domainEventFactory.createEmailBackupRequestedEvent).not.toHaveBeenCalled()
  })

  it('should trigger mute subscription emails rejection if mute setting changed', async () => {
    settingRepository.findOneByNameAndUserUuid = jest.fn().mockReturnValue(null)

    await createInterpreter().interpretSettingUpdated(
      SettingName.NAMES.MuteMarketingEmails,
      user,
      MuteMarketingEmailsOption.Muted,
    )

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createMuteEmailsSettingChangedEvent).toHaveBeenCalledWith({
      emailSubscriptionRejectionLevel: 'MARKETING',
      mute: true,
      username: 'test@test.te',
    })
  })
})
