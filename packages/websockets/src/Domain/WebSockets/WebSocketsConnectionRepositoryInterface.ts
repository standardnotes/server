import { Uuid } from '@standardnotes/domain-core'
import { Connection } from '../Connection/Connection'

export interface WebSocketsConnectionRepositoryInterface {
  findAllByUserUuid(userUuid: Uuid): Promise<Connection[]>
  saveConnection(connection: Connection): Promise<void>
  removeConnection(connectionId: string): Promise<void>
}
