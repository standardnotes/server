export interface ClientMessengerInterface {
  send(userUuid: string, message: string): Promise<void>
}
