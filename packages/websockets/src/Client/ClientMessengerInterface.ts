import { JSONString, Uuid } from '@standardnotes/common'

export interface ClientMessengerInterface {
  send(userUuid: Uuid, message: JSONString): Promise<void>
}
