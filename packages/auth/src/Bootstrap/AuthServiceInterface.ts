import { Result, ServiceInterface } from '@standardnotes/domain-core'

export interface AuthServiceInterface extends ServiceInterface {
  activatePremiumFeatures(username: string): Promise<Result<string>>
}
