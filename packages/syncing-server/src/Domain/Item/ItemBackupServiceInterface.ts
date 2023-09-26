import { KeyParamsData } from '@standardnotes/responses'
import { Result } from '@standardnotes/domain-core'

import { Item } from './Item'

export interface ItemBackupServiceInterface {
  backup(items: Array<Item>, authParams: KeyParamsData, contentSizeLimit?: number): Promise<string[]>
  dump(item: Item): Promise<Result<string>>
}
