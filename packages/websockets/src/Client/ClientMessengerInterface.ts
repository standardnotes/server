import { Uuid } from '@standardnotes/domain-core'

export interface ClientMessengerInterface {
  send(userUuid: Uuid, message: string): Promise<void>
}
