export interface EmailRequestedEventPayload {
  userEmail: string
  messageIdentifier: string
  level: string
  subject: string
  body: string
}
