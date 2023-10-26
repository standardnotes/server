import { SubscriptionName } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'
import { TokenEncoderInterface, ValetTokenData } from '@standardnotes/security'
import { CreateValetTokenResponseData } from '@standardnotes/responses'
import { SettingName } from '@standardnotes/settings'

import { UseCaseInterface } from '../UseCaseInterface'

import { CreateValetTokenDTO } from './CreateValetTokenDTO'
import { SubscriptionSettingsAssociationServiceInterface } from '../../Setting/SubscriptionSettingsAssociationServiceInterface'
import { CreateValetTokenPayload } from '../../ValetToken/CreateValetTokenPayload'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { GetSubscriptionSetting } from '../GetSubscriptionSetting/GetSubscriptionSetting'

export class CreateValetToken implements UseCaseInterface {
  constructor(
    private tokenEncoder: TokenEncoderInterface<ValetTokenData>,
    private subscriptionSettingsAssociationService: SubscriptionSettingsAssociationServiceInterface,
    private getRegularSubscription: GetRegularSubscriptionForUser,
    private getSharedSubscription: GetSharedSubscriptionForUser,
    private getSubscriptionSetting: GetSubscriptionSetting,
    private timer: TimerInterface,
    private valetTokenTTL: number,
  ) {}

  async execute(dto: CreateValetTokenDTO): Promise<CreateValetTokenResponseData> {
    const { userUuid, ...payload } = dto

    const regularSubscriptionOrError = await this.getRegularSubscription.execute({
      userUuid: dto.userUuid,
    })
    if (regularSubscriptionOrError.isFailed()) {
      return {
        success: false,
        reason: 'no-subscription',
      }
    }
    const regularSubscription = regularSubscriptionOrError.getValue()

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

    let uploadBytesUsed = 0
    const uploadBytesUsedSettingOrError = await this.getSubscriptionSetting.execute({
      userSubscriptionUuid: regularSubscription.uuid,
      settingName: SettingName.NAMES.FileUploadBytesUsed,
      allowSensitiveRetrieval: false,
    })
    if (!uploadBytesUsedSettingOrError.isFailed()) {
      const uploadBytesUsedSetting = uploadBytesUsedSettingOrError.getValue()
      uploadBytesUsed = +(uploadBytesUsedSetting.setting.props.value as string)
    }

    const defaultUploadBytesLimitForSubscription = await this.subscriptionSettingsAssociationService.getFileUploadLimit(
      regularSubscription.planName as SubscriptionName,
    )
    let uploadBytesLimit = defaultUploadBytesLimitForSubscription
    const overwriteWithUserUploadBytesLimitSettingOrError = await this.getSubscriptionSetting.execute({
      userSubscriptionUuid: regularSubscription.uuid,
      settingName: SettingName.NAMES.FileUploadBytesLimit,
      allowSensitiveRetrieval: false,
    })
    if (!overwriteWithUserUploadBytesLimitSettingOrError.isFailed()) {
      const overwriteWithUserUploadBytesLimitSetting = overwriteWithUserUploadBytesLimitSettingOrError.getValue()
      uploadBytesLimit = +(overwriteWithUserUploadBytesLimitSetting.setting.props.value as string)
    }

    let sharedSubscriptionUuid = undefined
    const sharedSubscriptionOrError = await this.getSharedSubscription.execute({
      userUuid,
    })
    if (!sharedSubscriptionOrError.isFailed()) {
      const sharedSubscription = sharedSubscriptionOrError.getValue()
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
