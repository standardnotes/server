export type CreateValetTokenPayload = {
  operation: 'read' | 'write' | 'delete' | 'move'
  resources: Array<{
    remoteIdentifier: string
    unencryptedFileSize?: number
  }>
}
