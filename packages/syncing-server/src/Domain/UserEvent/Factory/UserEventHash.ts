import { UserEventPayload } from '../Model/UserEventPayload'
import { UserEventType } from '../Model/UserEventType'

export type UserEventHash = {
  uuid: string
  user_uuid: string
  event_type: UserEventType
  event_payload: UserEventPayload
  created_at_timestamp?: number
  updated_at_timestamp?: number
}
