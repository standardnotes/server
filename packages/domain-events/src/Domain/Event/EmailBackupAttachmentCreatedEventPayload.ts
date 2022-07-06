export interface EmailBackupAttachmentCreatedEventPayload {
  backupFileName: string
  backupFileIndex: number
  backupFilesTotal: number
  email: string
}
