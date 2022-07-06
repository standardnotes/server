export interface ItemsSyncedEventPayload {
  userUuid: string
  extensionUrl: string
  extensionId: string
  itemUuids: Array<string>
  forceMute: boolean
  skipFileBackup: boolean
  source: 'backup' | 'account-deletion' | 'realtime-extensions-sync' | 'daily-extensions-sync'
}
