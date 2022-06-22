import { inject, injectable } from 'inversify'
import { SubscriptionName } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'
import { TokenEncoderInterface, ValetTokenData } from '@standardnotes/auth'
import { CreateValetTokenPayload, CreateValetTokenResponseData } from '@standardnotes/responses'
import { SubscriptionSettingName } from '@standardnotes/settings'

import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'

import { CreateValetTokenDTO } from './CreateValetTokenDTO'
import { SubscriptionSettingsAssociationServiceInterface } from '../../Setting/SubscriptionSettingsAssociationServiceInterface'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'

@injectable()
export class CreateValetToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.ValetTokenEncoder) private tokenEncoder: TokenEncoderInterface<ValetTokenData>,
    @inject(TYPES.SubscriptionSettingService) private subscriptionSettingService: SubscriptionSettingServiceInterface,
    @inject(TYPES.SubscriptionSettingsAssociationService)
    private subscriptionSettingsAssociationService: SubscriptionSettingsAssociationServiceInterface,
    @inject(TYPES.UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.VALET_TOKEN_TTL) private valetTokenTTL: number,
  ) {}

  async execute(dto: CreateValetTokenDTO): Promise<CreateValetTokenResponseData> {
    const { userUuid, ...payload } = dto
    const { regularSubscription, sharedSubscription } =
      await this.userSubscriptionService.findRegularSubscriptionForUserUuid(userUuid)
    if (regularSubscription === null) {
      return {
        success: false,
        reason: 'no-subscription',
      }
    }

    if (regularSubscription.endsAt < this.timer.getTimestampInMicroseconds()) {
      return {
        success: false,
        reason: 'expired-subscription',
      }
    }

    if (!this.isValidWritePayload(payload)) {
      return {
        success: false,
        reason: 'invalid-parameters',
      }
    }

    const regularSubscriptionUserUuid = (await regularSubscription.user).uuid

    let uploadBytesUsed = 0
    const uploadBytesUsedSetting = await this.subscriptionSettingService.findSubscriptionSettingWithDecryptedValue({
      userUuid: regularSubscriptionUserUuid,
      userSubscriptionUuid: regularSubscription.uuid,
      subscriptionSettingName: SubscriptionSettingName.FileUploadBytesUsed,
    })
    if (uploadBytesUsedSetting !== null) {
      uploadBytesUsed = +(uploadBytesUsedSetting.value as string)
    }

    const defaultUploadBytesLimitForSubscription = await this.subscriptionSettingsAssociationService.getFileUploadLimit(
      regularSubscription.planName as SubscriptionName,
    )
    let uploadBytesLimit = defaultUploadBytesLimitForSubscription
    const overwriteWithUserUploadBytesLimitSetting =
      await this.subscriptionSettingService.findSubscriptionSettingWithDecryptedValue({
        userUuid: regularSubscriptionUserUuid,
        userSubscriptionUuid: regularSubscription.uuid,
        subscriptionSettingName: SubscriptionSettingName.FileUploadBytesLimit,
      })
    if (overwriteWithUserUploadBytesLimitSetting !== null) {
      uploadBytesLimit = +(overwriteWithUserUploadBytesLimitSetting.value as string)
    }

    let sharedSubscriptionUuid = undefined
    if (sharedSubscription !== null) {
      sharedSubscriptionUuid = sharedSubscription.uuid
    }

    const tokenData: ValetTokenData = {
      userUuid: dto.userUuid,
      permittedOperation: dto.operation,
      permittedResources: dto.resources,
      uploadBytesUsed,
      uploadBytesLimit,
      sharedSubscriptionUuid,
      regularSubscriptionUuid: regularSubscription.uuid,
    }

    const valetToken = this.tokenEncoder.encodeExpirableToken(tokenData, this.valetTokenTTL)

    return { success: true, valetToken }
  }

  private isValidWritePayload(payload: CreateValetTokenPayload) {
    if (payload.operation === 'write') {
      for (const resource of payload.resources) {
        if (resource.unencryptedFileSize === undefined) {
          return false
        }
      }
    }

    return true
  }
}
