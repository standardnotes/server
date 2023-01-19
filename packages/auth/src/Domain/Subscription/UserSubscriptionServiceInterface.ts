import { FindRegularSubscriptionResponse } from './FindRegularSubscriptionResponse'

export interface UserSubscriptionServiceInterface {
  findRegularSubscriptionForUuid(uuid: string): Promise<FindRegularSubscriptionResponse>
  findRegularSubscriptionForUserUuid(userUuid: string): Promise<FindRegularSubscriptionResponse>
}
