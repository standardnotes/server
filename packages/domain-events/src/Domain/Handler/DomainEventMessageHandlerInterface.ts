export interface DomainEventMessageHandlerInterface {
  handleMessage(message: string): Promise<void>
  handleError(error: Error): Promise<void>
}
