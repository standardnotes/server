import { DomainEventHandlerInterface, FileRemovedEvent } from '@standardnotes/domain-events'
import { SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { SubscriptionSettingServiceInterface } from '../Setting/SubscriptionSettingServiceInterface'
import { UserSubscription } from '../Subscription/UserSubscription'
import { UserSubscriptionServiceInterface } from '../Subscription/UserSubscriptionServiceInterface'

@injectable()
export class FileRemovedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Auth_UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
    @inject(TYPES.Auth_SubscriptionSettingService)
    private subscriptionSettingService: SubscriptionSettingServiceInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async handle(event: FileRemovedEvent): Promise<void> {
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
    const user = await subscription.user
    const bytesUsedSetting = await this.subscriptionSettingService.findSubscriptionSettingWithDecryptedValue({
      userUuid: user.uuid,
      userSubscriptionUuid: subscription.uuid,
      subscriptionSettingName: SettingName.create(SettingName.NAMES.FileUploadBytesUsed).getValue(),
    })
    if (bytesUsedSetting === null) {
      this.logger.warn(`Could not find bytes used setting for user with uuid: ${user.uuid}`)

      return
    }

    const bytesUsed = bytesUsedSetting.value as string

    await this.subscriptionSettingService.createOrReplace({
      userSubscription: subscription,
      user,
      props: {
        name: SettingName.NAMES.FileUploadBytesUsed,
        unencryptedValue: (+bytesUsed - byteSize).toString(),
        sensitive: false,
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
      },
    })
  }
}
