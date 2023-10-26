import { Result, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { SettingName } from '@standardnotes/settings'

import { SetSubscriptionSettingValueDTO } from './SetSubscriptionSettingValueDTO'
import { SubscriptionSettingRepositoryInterface } from '../../Setting/SubscriptionSettingRepositoryInterface'
import { GetSubscriptionSetting } from '../GetSubscriptionSetting/GetSubscriptionSetting'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'

export class SetSubscriptionSettingValue implements UseCaseInterface<void> {
  constructor(
    private subscriptionSettingRepository: SubscriptionSettingRepositoryInterface,
    private getSubscriptionSetting: GetSubscriptionSetting,
    private timer: TimerInterface,
  ) {}

  async execute(dto: SetSubscriptionSettingValueDTO): Promise<Result<void>> {
    const userSubscriptionUuidOrError = Uuid.create(dto.userSubscriptionUuid)
    if (userSubscriptionUuidOrError.isFailed()) {
      return Result.fail(userSubscriptionUuidOrError.getError())
    }
    const userSubscriptionUuid = userSubscriptionUuidOrError.getValue()

    let newUserSubscriptionUuid: Uuid | undefined
    if (dto.newUserSubscriptionUuid !== undefined) {
      const newUserSubscriptionUuidOrError = Uuid.create(dto.newUserSubscriptionUuid)
      if (newUserSubscriptionUuidOrError.isFailed()) {
        return Result.fail(newUserSubscriptionUuidOrError.getError())
      }
      newUserSubscriptionUuid = newUserSubscriptionUuidOrError.getValue()
    }

    const settingNameOrError = SettingName.create(dto.settingName)
    if (settingNameOrError.isFailed()) {
      return Result.fail(settingNameOrError.getError())
    }
    const settingName = settingNameOrError.getValue()

    if (!settingName.isASubscriptionSetting()) {
      return Result.fail(`Setting ${settingName.value} is not a subscription setting!`)
    }

    const settingExists = await this.getSubscriptionSetting.execute({
      userSubscriptionUuid: userSubscriptionUuid.value,
      settingName: settingName.value,
      allowSensitiveRetrieval: true,
    })
    if (settingExists.isFailed()) {
      const timestamps = Timestamps.create(
        this.timer.getTimestampInMicroseconds(),
        this.timer.getTimestampInMicroseconds(),
      ).getValue()

      const subscriptionSettingOrError = SubscriptionSetting.create({
        name: settingName.value,
        value: dto.value,
        userSubscriptionUuid: newUserSubscriptionUuid ?? userSubscriptionUuid,
        serverEncryptionVersion: dto.serverEncryptionVersion,
        timestamps,
        sensitive: false,
      })
      if (subscriptionSettingOrError.isFailed()) {
        return Result.fail(subscriptionSettingOrError.getError())
      }
      const subscriptionSetting = subscriptionSettingOrError.getValue()

      await this.subscriptionSettingRepository.insert(subscriptionSetting)

      return Result.ok()
    }

    const { setting } = settingExists.getValue()
    setting.props.value = dto.value
    setting.props.timestamps = Timestamps.create(
      setting.props.timestamps.createdAt,
      this.timer.getTimestampInMicroseconds(),
    ).getValue()
    if (newUserSubscriptionUuid !== undefined) {
      setting.props.userSubscriptionUuid = newUserSubscriptionUuid
    }

    await this.subscriptionSettingRepository.update(setting)

    return Result.ok()
  }
}
