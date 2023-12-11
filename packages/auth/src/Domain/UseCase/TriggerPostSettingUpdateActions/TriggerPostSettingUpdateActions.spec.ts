import {
  DomainEventPublisherInterface,
  EmailBackupRequestedEvent,
  MuteEmailsSettingChangedEvent,
  UserDisabledSessionUserAgentLoggingEvent,
} from '@standardnotes/domain-events'
import { EmailBackupFrequency, LogSessionUserAgentOption, MuteMarketingEmailsOption } from '@standardnotes/settings'
import { SettingName, Result } from '@standardnotes/domain-core'

import { GenerateRecoveryCodes } from '../GenerateRecoveryCodes/GenerateRecoveryCodes'
import { TriggerPostSettingUpdateActions } from './TriggerPostSettingUpdateActions'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { TriggerEmailBackupForUser } from '../TriggerEmailBackupForUser/TriggerEmailBackupForUser'

describe('TriggerPostSettingUpdateActions', () => {
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let triggerEmailBackupForUser: TriggerEmailBackupForUser
  let generateRecoveryCodes: GenerateRecoveryCodes

  const createUseCase = () =>
    new TriggerPostSettingUpdateActions(
      domainEventPublisher,
      domainEventFactory,
      triggerEmailBackupForUser,
      generateRecoveryCodes,
    )

  beforeEach(() => {
    generateRecoveryCodes = {} as jest.Mocked<GenerateRecoveryCodes>
    generateRecoveryCodes.execute = jest.fn().mockReturnValue(Result.ok())

    triggerEmailBackupForUser = {} as jest.Mocked<TriggerEmailBackupForUser>
    triggerEmailBackupForUser.execute = jest.fn().mockReturnValue(Result.ok())

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
  })

  it('should trigger session cleanup if user is disabling session user agent logging', async () => {
    await createUseCase().execute({
      updatedSettingName: SettingName.NAMES.LogSessionUserAgent,
      userUuid: '4-5-6',
      userEmail: 'test@test.te',
      unencryptedValue: LogSessionUserAgentOption.Disabled,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createUserDisabledSessionUserAgentLoggingEvent).toHaveBeenCalledWith({
      userUuid: '4-5-6',
      email: 'test@test.te',
    })
  })

  it('should trigger backup if email backup setting is created - emails not muted', async () => {
    await createUseCase().execute({
      updatedSettingName: SettingName.NAMES.EmailBackupFrequency,
      userUuid: '4-5-6',
      userEmail: 'test@test.te',
      unencryptedValue: EmailBackupFrequency.Daily,
    })

    expect(triggerEmailBackupForUser.execute).toHaveBeenCalled()
  })

  it('should trigger backup if email backup setting is created - emails muted', async () => {
    await createUseCase().execute({
      updatedSettingName: SettingName.NAMES.EmailBackupFrequency,
      userUuid: '4-5-6',
      userEmail: 'test@test.te',
      unencryptedValue: EmailBackupFrequency.Daily,
    })

    expect(triggerEmailBackupForUser.execute).toHaveBeenCalled()
  })

  it('should not trigger backup if email backup setting is disabled', async () => {
    await createUseCase().execute({
      updatedSettingName: SettingName.NAMES.EmailBackupFrequency,
      userUuid: '4-5-6',
      userEmail: 'test@test.te',
      unencryptedValue: EmailBackupFrequency.Disabled,
    })

    expect(triggerEmailBackupForUser.execute).not.toHaveBeenCalled()
  })

  it('should trigger mute subscription emails rejection if mute setting changed', async () => {
    await createUseCase().execute({
      updatedSettingName: SettingName.NAMES.MuteMarketingEmails,
      userUuid: '4-5-6',
      userEmail: 'test@test.te',
      unencryptedValue: MuteMarketingEmailsOption.Muted,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createMuteEmailsSettingChangedEvent).toHaveBeenCalledWith({
      emailSubscriptionRejectionLevel: 'MARKETING',
      mute: true,
      username: 'test@test.te',
    })
  })

  it('should generate new recovery codes upon enabling mfa setting', async () => {
    await createUseCase().execute({
      updatedSettingName: SettingName.NAMES.MfaSecret,
      userUuid: '4-5-6',
      userEmail: 'test@test.te',
      unencryptedValue: '123',
    })

    expect(generateRecoveryCodes.execute).toHaveBeenCalled()
  })
})
