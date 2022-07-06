export interface MailBackupAttachmentTooBigEventPayload {
  allowedSize: string
  attachmentSize: string
  muteEmailsSettingUuid: string
  extensionSettingUuid?: string
  email: string
}
