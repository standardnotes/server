import { Result, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { SettingName } from '@standardnotes/settings'
import { TimerInterface } from '@standardnotes/time'

import { Setting } from '../../Setting/Setting'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { GetSetting } from '../GetSetting/GetSetting'
import { SetSettingValueDTO } from './SetSettingValueDTO'
import { SettingsAssociationServiceInterface } from '../../Setting/SettingsAssociationServiceInterface'
import { RoleServiceInterface } from '../../Role/RoleServiceInterface'

export class SetSettingValue implements UseCaseInterface<Setting> {
  constructor(
    private getSetting: GetSetting,
    private settingRepository: SettingRepositoryInterface,
    private timer: TimerInterface,
    private settingsAssociationService: SettingsAssociationServiceInterface,
    private roleService: RoleServiceInterface,
  ) {}

  async execute(dto: SetSettingValueDTO): Promise<Result<Setting>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const settingNameOrError = SettingName.create(dto.settingName)
    if (settingNameOrError.isFailed()) {
      return Result.fail(settingNameOrError.getError())
    }
    const settingName = settingNameOrError.getValue()

    if (settingName.isASubscriptionSetting()) {
      return Result.fail(`Setting ${settingName.value} is a subscription setting!`)
    }

    if (!(await this.userHasPermissionToUpdateSetting(userUuid, settingName))) {
      return Result.fail(`User ${userUuid.value} does not have permission to update setting ${settingName.value}.`)
    }

    const settingExists = await this.getSetting.execute({
      userUuid: userUuid.value,
      settingName: settingName.value,
      allowSensitiveRetrieval: true,
      decrypted: false,
    })
    if (settingExists.isFailed()) {
      const settingOrError = Setting.create({
        name: settingName.value,
        value: dto.value,
        userUuid,
        serverEncryptionVersion: dto.serverEncryptionVersion,
        sensitive: dto.sensitive,
        timestamps: Timestamps.create(
          this.timer.getTimestampInMicroseconds(),
          this.timer.getTimestampInMicroseconds(),
        ).getValue(),
      })
      if (settingOrError.isFailed()) {
        return Result.fail(settingOrError.getError())
      }
      const setting = settingOrError.getValue()

      await this.settingRepository.insert(setting)

      return Result.ok(setting)
    }

    const { setting } = settingExists.getValue()
    setting.props.value = dto.value
    setting.props.timestamps = Timestamps.create(
      setting.props.timestamps.createdAt,
      this.timer.getTimestampInMicroseconds(),
    ).getValue()

    await this.settingRepository.update(setting)

    return Result.ok(setting)
  }

  private async userHasPermissionToUpdateSetting(userUuid: Uuid, settingName: SettingName): Promise<boolean> {
    const settingIsMutableByClient = this.settingsAssociationService.isSettingMutableByClient(settingName)
    if (!settingIsMutableByClient) {
      return false
    }

    const permissionAssociatedWithSetting =
      this.settingsAssociationService.getPermissionAssociatedWithSetting(settingName)
    if (permissionAssociatedWithSetting === undefined) {
      return true
    }

    return this.roleService.userHasPermission(userUuid.value, permissionAssociatedWithSetting)
  }
}
