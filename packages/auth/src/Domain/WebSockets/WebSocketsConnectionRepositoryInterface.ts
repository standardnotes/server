export interface WebSocketsConnectionRepositoryInterface {
  findAllByUserUuid(userUuid: string): Promise<string[]>
  saveConnection(userUuid: string, connectionId: string): Promise<void>
  removeConnection(connectionId: string): Promise<void>
}
