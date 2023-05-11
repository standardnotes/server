import { DomainEventHandlerInterface, FileUploadedEvent } from '@standardnotes/domain-events'
import { SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { SubscriptionSettingServiceInterface } from '../Setting/SubscriptionSettingServiceInterface'
import { UserSubscription } from '../Subscription/UserSubscription'
import { UserSubscriptionServiceInterface } from '../Subscription/UserSubscriptionServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

@injectable()
export class FileUploadedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
    @inject(TYPES.Auth_SubscriptionSettingService) private subscriptionSettingService: SubscriptionSettingServiceInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async handle(event: FileUploadedEvent): Promise<void> {
    const user = await this.userRepository.findOneByUuid(event.payload.userUuid)
    if (user === null) {
      this.logger.warn(`Could not find user with uuid: ${event.payload.userUuid}`)

      return
    }

    const { regularSubscription, sharedSubscription } =
      await this.userSubscriptionService.findRegularSubscriptionForUserUuid(event.payload.userUuid)
    if (regularSubscription === null) {
      this.logger.warn(`Could not find regular user subscription for user with uuid: ${event.payload.userUuid}`)

      return
    }

    await this.updateUploadBytesUsedSetting(regularSubscription, event.payload.fileByteSize)

    if (sharedSubscription !== null) {
      await this.updateUploadBytesUsedSetting(sharedSubscription, event.payload.fileByteSize)
    }
  }

  private async updateUploadBytesUsedSetting(subscription: UserSubscription, byteSize: number): Promise<void> {
    let bytesUsed = '0'
    const bytesUsedSetting = await this.subscriptionSettingService.findSubscriptionSettingWithDecryptedValue({
      userUuid: (await subscription.user).uuid,
      userSubscriptionUuid: subscription.uuid,
      subscriptionSettingName: SettingName.create(SettingName.NAMES.FileUploadBytesUsed).getValue(),
    })
    if (bytesUsedSetting !== null) {
      bytesUsed = bytesUsedSetting.value as string
    }

    await this.subscriptionSettingService.createOrReplace({
      userSubscription: subscription,
      props: {
        name: SettingName.NAMES.FileUploadBytesUsed,
        unencryptedValue: (+bytesUsed + byteSize).toString(),
        sensitive: false,
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
      },
    })
  }
}
