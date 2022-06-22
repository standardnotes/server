import { KeyParamsData } from '@standardnotes/responses'
import { Item } from './Item'

export interface ItemBackupServiceInterface {
  backup(items: Array<Item>, authParams: KeyParamsData): Promise<string>
}
