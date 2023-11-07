import { Result, SettingName, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { PermissionName } from '@standardnotes/features'

import { TriggerEmailBackupForUserDTO } from './TriggerEmailBackupForUserDTO'
import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { GetSetting } from '../GetSetting/GetSetting'
import { MuteFailedBackupsEmailsOption } from '@standardnotes/settings'
import { GetUserKeyParams } from '../GetUserKeyParams/GetUserKeyParams'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'

export class TriggerEmailBackupForUser implements UseCaseInterface<void> {
  constructor(
    private roleService: RoleServiceInterface,
    private getSetting: GetSetting,
    private getUserKeyParamsUseCase: GetUserKeyParams,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: TriggerEmailBackupForUserDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const userIsPermittedForEmailBackups = await this.roleService.userHasPermission(
      userUuid.value,
      PermissionName.DailyEmailBackup,
    )

    if (!userIsPermittedForEmailBackups) {
      return Result.fail(`User ${userUuid.value} is not permitted for email backups`)
    }

    let userHasEmailsMuted = false
    const emailsMutedSettingOrError = await this.getSetting.execute({
      allowSensitiveRetrieval: true,
      decrypted: true,
      settingName: SettingName.NAMES.MuteFailedBackupsEmails,
      userUuid: userUuid.value,
    })
    let emailsMutedSetting = null
    if (!emailsMutedSettingOrError.isFailed()) {
      emailsMutedSetting = emailsMutedSettingOrError.getValue()
      userHasEmailsMuted = emailsMutedSetting.decryptedValue === MuteFailedBackupsEmailsOption.Muted
    }

    const keyParamsResponse = await this.getUserKeyParamsUseCase.execute({
      userUuid: userUuid.value,
      authenticated: false,
    })

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createEmailBackupRequestedEvent(
        userUuid.value,
        emailsMutedSetting?.setting.id.toString() as string,
        userHasEmailsMuted,
        keyParamsResponse.keyParams,
      ),
    )

    return Result.ok()
  }
}
