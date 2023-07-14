import { Result, ServiceInterface } from '@standardnotes/domain-core'

export interface AuthServiceInterface extends ServiceInterface {
  activatePremiumFeatures(dto: {
    username: string
    subscriptionPlanName?: string
    endsAt?: Date
  }): Promise<Result<string>>
}
