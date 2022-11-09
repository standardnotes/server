import { Email } from '../../Common/Email'
import { Uuid } from '../../Common/Uuid'

export type GetUserAnalyticsIdResponse = {
  analyticsId: number
  userEmail: Email
  userUuid: Uuid
}
