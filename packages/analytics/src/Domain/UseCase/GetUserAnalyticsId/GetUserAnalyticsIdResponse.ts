import { Email, Uuid } from '@standardnotes/domain-core'

export type GetUserAnalyticsIdResponse = {
  analyticsId: number
  userEmail: Email
  userUuid: Uuid
}
