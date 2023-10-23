import { Result, ServiceInterface } from '@standardnotes/domain-core'

export interface AuthServiceInterface extends ServiceInterface {
  activatePremiumFeatures(dto: {
    username: string
    subscriptionId: number
    subscriptionPlanName?: string
    endsAt?: Date
    cancelPreviousSubscription?: boolean
  }): Promise<Result<string>>
}
