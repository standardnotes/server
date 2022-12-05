import { Username, Uuid } from '@standardnotes/domain-core'

export type GetUserAnalyticsIdResponse = {
  analyticsId: number
  username: Username
  userUuid: Uuid
}
