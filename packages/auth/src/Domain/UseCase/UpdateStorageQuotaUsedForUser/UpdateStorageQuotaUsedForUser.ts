import { Result, SettingName, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { UpdateStorageQuotaUsedForUserDTO } from './UpdateStorageQuotaUsedForUserDTO'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { GetSubscriptionSetting } from '../GetSubscriptionSetting/GetSubscriptionSetting'
import { SetSubscriptionSettingValue } from '../SetSubscriptionSettingValue/SetSubscriptionSettingValue'
import { Logger } from 'winston'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'

export class UpdateStorageQuotaUsedForUser implements UseCaseInterface<void> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private getRegularSubscription: GetRegularSubscriptionForUser,
    private getSharedSubscription: GetSharedSubscriptionForUser,
    private getSubscriptionSetting: GetSubscriptionSetting,
    private setSubscriptonSettingValue: SetSubscriptionSettingValue,
    private logger: Logger,
  ) {}

  async execute(dto: UpdateStorageQuotaUsedForUserDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(userUuid)
    if (user === null) {
      return Result.fail(`Could not find user with uuid: ${userUuid.value}`)
    }

    const regularSubscriptionOrError = await this.getRegularSubscription.execute({
      userUuid: user.uuid,
    })
    if (regularSubscriptionOrError.isFailed()) {
      return Result.fail(`Could not find regular user subscription for user with uuid: ${userUuid.value}`)
    }
    const regularSubscription = regularSubscriptionOrError.getValue()

    await this.updateUploadBytesUsedSetting(regularSubscription, dto.bytesUsed)

    const sharedSubscriptionOrError = await this.getSharedSubscription.execute({
      userUuid: user.uuid,
    })
    if (!sharedSubscriptionOrError.isFailed()) {
      const sharedSubscription = sharedSubscriptionOrError.getValue()
      await this.updateUploadBytesUsedSetting(sharedSubscription, dto.bytesUsed)
    }

    return Result.ok()
  }

  private async updateUploadBytesUsedSetting(subscription: UserSubscription, bytesUsed: number): Promise<void> {
    let bytesAlreadyUsed = '0'
    const subscriptionUser = await subscription.user

    const bytesUsedSettingExists = await this.getSubscriptionSetting.execute({
      userSubscriptionUuid: subscription.uuid,
      settingName: SettingName.NAMES.FileUploadBytesUsed,
      allowSensitiveRetrieval: false,
    })

    if (!bytesUsedSettingExists.isFailed()) {
      const bytesUsedSetting = bytesUsedSettingExists.getValue()
      bytesAlreadyUsed = bytesUsedSetting.setting.props.value as string
    }

    const result = await this.setSubscriptonSettingValue.execute({
      userSubscriptionUuid: subscription.uuid,
      settingName: SettingName.NAMES.FileUploadBytesUsed,
      value: (+bytesAlreadyUsed + bytesUsed).toString(),
    })

    /* istanbul ignore next */
    if (result.isFailed()) {
      this.logger.error(`Could not set file upload bytes used for user ${subscriptionUser.uuid}`)
    }
  }
}
