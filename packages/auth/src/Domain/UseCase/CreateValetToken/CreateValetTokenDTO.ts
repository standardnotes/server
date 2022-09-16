import { ValetTokenOperation } from '@standardnotes/security'

export type CreateValetTokenDTO = {
  operation: ValetTokenOperation
  resources: Array<{
    remoteIdentifier: string
    unencryptedFileSize?: number
  }>
  userUuid: string
}
