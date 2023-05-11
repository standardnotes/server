import { inject, injectable } from 'inversify'
import { SubscriptionName } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'
import { TokenEncoderInterface, ValetTokenData } from '@standardnotes/security'
import { CreateValetTokenPayload, CreateValetTokenResponseData } from '@standardnotes/responses'
import { SettingName } from '@standardnotes/settings'

import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'

import { CreateValetTokenDTO } from './CreateValetTokenDTO'
import { SubscriptionSettingsAssociationServiceInterface } from '../../Setting/SubscriptionSettingsAssociationServiceInterface'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'

@injectable()
export class CreateValetToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_ValetTokenEncoder) private tokenEncoder: TokenEncoderInterface<ValetTokenData>,
    @inject(TYPES.Auth_SubscriptionSettingService) private subscriptionSettingService: SubscriptionSettingServiceInterface,
    @inject(TYPES.Auth_SubscriptionSettingsAssociationService)
    private subscriptionSettingsAssociationService: SubscriptionSettingsAssociationServiceInterface,
    @inject(TYPES.Auth_UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
    @inject(TYPES.Auth_VALET_TOKEN_TTL) private valetTokenTTL: number,
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
      subscriptionSettingName: SettingName.create(SettingName.NAMES.FileUploadBytesUsed).getValue(),
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
        subscriptionSettingName: SettingName.create(SettingName.NAMES.FileUploadBytesLimit).getValue(),
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
