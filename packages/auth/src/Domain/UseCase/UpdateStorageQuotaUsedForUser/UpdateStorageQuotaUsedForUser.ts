import { Result, SettingName, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { UpdateStorageQuotaUsedForUserDTO } from './UpdateStorageQuotaUsedForUserDTO'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { Logger } from 'winston'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { SubscriptionSettingRepositoryInterface } from '../../Setting/SubscriptionSettingRepositoryInterface'

export class UpdateStorageQuotaUsedForUser implements UseCaseInterface<void> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private getRegularSubscription: GetRegularSubscriptionForUser,
    private getSharedSubscription: GetSharedSubscriptionForUser,
    private subscriptionSettingRepository: SubscriptionSettingRepositoryInterface,
    private timer: TimerInterface,
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

    const sharedSubscriptionOrError = await this.getSharedSubscription.execute({
      userUuid: user.uuid,
    })
    let sharedSubscription: UserSubscription | undefined
    if (!sharedSubscriptionOrError.isFailed()) {
      sharedSubscription = sharedSubscriptionOrError.getValue()
      await this.updateUploadBytesUsedSetting(sharedSubscription, dto.bytesUsed)
    }

    const regularSubscriptionOrError = await this.getRegularSubscription.execute({
      userUuid: sharedSubscription ? undefined : user.uuid,
      subscriptionId: sharedSubscription ? (sharedSubscription.subscriptionId as number) : undefined,
    })
    if (regularSubscriptionOrError.isFailed()) {
      return Result.fail(`Could not find regular user subscription for user with uuid: ${userUuid.value}`)
    }
    const regularSubscription = regularSubscriptionOrError.getValue()

    await this.updateUploadBytesUsedSetting(regularSubscription, dto.bytesUsed)

    return Result.ok()
  }

  private async updateUploadBytesUsedSetting(subscription: UserSubscription, bytesUsed: number): Promise<void> {
    const userSubscriptionUuidOrError = Uuid.create(subscription.uuid)
    if (userSubscriptionUuidOrError.isFailed()) {
      this.logger.error(
        `Could not update file upload bytes used for subscription ${subscription.uuid}: ${userSubscriptionUuidOrError.getError()}`,
      )
      return
    }
    const userSubscriptionUuid = userSubscriptionUuidOrError.getValue()

    // Apply the change as an atomic database-level delta that creates the row if it does not exist.
    // The unique index on (name, user_subscription_uuid) makes this race-safe for both concurrent
    // increments and concurrent first-time creations, so no read/lock/transaction is needed here.
    await this.subscriptionSettingRepository.incrementCounterValueForNameAndUserSubscriptionUuid(
      SettingName.NAMES.FileUploadBytesUsed,
      userSubscriptionUuid,
      bytesUsed,
      this.timer.getTimestampInMicroseconds(),
    )
  }
}
