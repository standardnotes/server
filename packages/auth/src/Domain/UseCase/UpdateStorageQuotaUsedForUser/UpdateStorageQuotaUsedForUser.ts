import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { SettingName } from '@standardnotes/settings'

import { EncryptionVersion } from '../../Encryption/EncryptionVersion'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { UpdateStorageQuotaUsedForUserDTO } from './UpdateStorageQuotaUsedForUserDTO'

export class UpdateStorageQuotaUsedForUser implements UseCaseInterface<void> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private userSubscriptionService: UserSubscriptionServiceInterface,
    private subscriptionSettingService: SubscriptionSettingServiceInterface,
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

    const { regularSubscription, sharedSubscription } =
      await this.userSubscriptionService.findRegularSubscriptionForUserUuid(userUuid.value)
    if (regularSubscription === null) {
      return Result.fail(`Could not find regular user subscription for user with uuid: ${userUuid.value}`)
    }

    await this.updateUploadBytesUsedSetting(regularSubscription, dto.bytesUsed)

    if (sharedSubscription !== null) {
      await this.updateUploadBytesUsedSetting(sharedSubscription, dto.bytesUsed)
    }

    return Result.ok()
  }

  private async updateUploadBytesUsedSetting(subscription: UserSubscription, bytesUsed: number): Promise<void> {
    let bytesAlreadyUsed = '0'
    const subscriptionUser = await subscription.user
    const bytesUsedSetting = await this.subscriptionSettingService.findSubscriptionSettingWithDecryptedValue({
      userUuid: subscriptionUser.uuid,
      userSubscriptionUuid: subscription.uuid,
      subscriptionSettingName: SettingName.create(SettingName.NAMES.FileUploadBytesUsed).getValue(),
    })
    if (bytesUsedSetting !== null) {
      bytesAlreadyUsed = bytesUsedSetting.value as string
    }

    await this.subscriptionSettingService.createOrReplace({
      userSubscription: subscription,
      user: subscriptionUser,
      props: {
        name: SettingName.NAMES.FileUploadBytesUsed,
        unencryptedValue: (+bytesAlreadyUsed + bytesUsed).toString(),
        sensitive: false,
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
      },
    })
  }
}
