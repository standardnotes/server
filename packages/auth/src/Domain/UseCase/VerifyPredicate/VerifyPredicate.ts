import { PredicateName, PredicateVerificationResult } from '@standardnotes/predicates'
import { EmailBackupFrequency, SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'

import { VerifyPredicateDTO } from './VerifyPredicateDTO'
import { VerifyPredicateResponse } from './VerifyPredicateResponse'

@injectable()
export class VerifyPredicate implements UseCaseInterface {
  constructor(
    @inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface,
    @inject(TYPES.UserSubscriptionRepository) private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
  ) {}

  async execute(dto: VerifyPredicateDTO): Promise<VerifyPredicateResponse> {
    switch (dto.predicate.name) {
      case PredicateName.EmailBackupsEnabled:
        return (await this.hasUserEnabledEmailBackups(dto.userUuid))
          ? { predicateVerificationResult: PredicateVerificationResult.Affirmed }
          : { predicateVerificationResult: PredicateVerificationResult.Denied }
      case PredicateName.SubscriptionPurchased:
        return (await this.hasUserBoughtASubscription(dto.userUuid))
          ? { predicateVerificationResult: PredicateVerificationResult.Affirmed }
          : { predicateVerificationResult: PredicateVerificationResult.Denied }
      default:
        throw new Error(`Predicate not supported: ${dto.predicate.name}`)
    }
  }

  private async hasUserBoughtASubscription(userUuid: string): Promise<boolean> {
    const subscription = await this.userSubscriptionRepository.findOneByUserUuid(userUuid)

    return subscription !== null
  }

  private async hasUserEnabledEmailBackups(userUuid: string): Promise<boolean> {
    const setting = await this.settingRepository.findOneByNameAndUserUuid(
      SettingName.NAMES.EmailBackupFrequency,
      userUuid,
    )

    if (setting === null || setting.value === EmailBackupFrequency.Disabled) {
      return false
    }

    return true
  }
}
