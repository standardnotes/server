import { JSONString, Uuid } from '@standardnotes/common'

export interface WebSocketMessageRequestedEventPayload {
  userUuid: Uuid
  message: JSONString
}
