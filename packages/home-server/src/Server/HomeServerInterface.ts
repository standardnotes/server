import { Result } from '@standardnotes/domain-core'
import { HomeServerConfiguration } from './HomeServerConfiguration'

export interface HomeServerInterface {
  start(configuration?: HomeServerConfiguration): Promise<Result<string>>
  activatePremiumFeatures(dto: {
    username: string
    subscriptionId: number
    subscriptionPlanName?: string
    uploadBytesLimit?: number
    endsAt?: Date
    cancelPreviousSubscription?: boolean
  }): Promise<Result<string>>
  stop(): Promise<Result<string>>
  isRunning(): Promise<boolean>
}
