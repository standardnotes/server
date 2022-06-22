import { Uuid } from '@standardnotes/common'

export type RemoveFileDTO = {
  userUuid: Uuid
  resourceRemoteIdentifier: string
  regularSubscriptionUuid: Uuid
}
