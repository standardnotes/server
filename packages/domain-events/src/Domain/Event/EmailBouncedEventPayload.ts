export interface EmailBouncedEventPayload {
  recipientEmail: string
  bounceType: string
  bounceSubType: string
  diagnosticCode?: string
}
