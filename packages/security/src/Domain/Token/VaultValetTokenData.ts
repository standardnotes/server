import { ValetTokenOperation } from './ValetTokenOperation'

export type VaultValetTokenData = {
  vaultUuid: string
  permittedOperation: ValetTokenOperation
  remoteIdentifier: string
}
