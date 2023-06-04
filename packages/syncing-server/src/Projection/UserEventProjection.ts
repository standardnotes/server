import { UserEventType } from '../Domain/UserEvent/Model/UserEventType'

export type UserEventProjection = {
  uuid: string
  user_uuid: string
  event_type: UserEventType
  event_payload: string
  created_at_timestamp: number
  updated_at_timestamp: number
}
