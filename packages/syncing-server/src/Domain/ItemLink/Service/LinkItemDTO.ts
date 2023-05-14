import { ContentType } from '@standardnotes/common'

export type ShareItemDTO = {
  itemUuid: string
  userUuid: string
  permissions: string
  encryptedContentKey: string
  contentType: ContentType
  fileRemoteIdentifier?: string
  duration: string
}
