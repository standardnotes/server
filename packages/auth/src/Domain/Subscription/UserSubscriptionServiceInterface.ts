import { Uuid } from '@standardnotes/common'
import { FindRegularSubscriptionResponse } from './FindRegularSubscriptionResponse'

export interface UserSubscriptionServiceInterface {
  findRegularSubscriptionForUuid(uuid: Uuid): Promise<FindRegularSubscriptionResponse>
  findRegularSubscriptionForUserUuid(userUuid: Uuid): Promise<FindRegularSubscriptionResponse>
}
