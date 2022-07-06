export interface EmailMessageRequestedEventPayload {
  userEmail: string
  messageIdentifier: string
  context: Record<string, unknown>
}
