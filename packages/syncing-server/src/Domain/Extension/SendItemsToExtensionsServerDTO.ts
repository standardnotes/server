import { KeyParamsData } from '@standardnotes/responses'

import { Item } from '../Item/Item'

export type SendItemsToExtensionsServerDTO = {
  extensionsServerUrl: string
  extensionId: string
  backupFilename: string
  authParams: KeyParamsData
  forceMute: boolean
  userUuid: string
  items?: Array<Item>
}
