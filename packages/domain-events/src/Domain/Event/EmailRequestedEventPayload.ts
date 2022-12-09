export interface EmailRequestedEventPayload {
  userEmail: string
  messageIdentifier: string
  level: string
  subject: string
  body: string
  sender?: string
  attachments?: Array<{
    filePath: string
    fileName: string
    attachmentFileName: string
    attachmentContentType: string
  }>
}
