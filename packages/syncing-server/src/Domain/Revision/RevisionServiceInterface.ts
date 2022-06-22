import { RoleName } from '@standardnotes/common'
import { Item } from '../Item/Item'
import { Revision } from './Revision'

export interface RevisionServiceInterface {
  createRevision(item: Item): Promise<void>
  copyRevisions(fromItemUuid: string, toItemUuid: string): Promise<void>
  getRevisions(userUuid: string, itemUuid: string): Promise<Revision[]>
  getRevision(dto: {
    userUuid: string
    userRoles: RoleName[]
    itemUuid: string
    revisionUuid: string
  }): Promise<Revision | null>
  removeRevision(dto: { userUuid: string; itemUuid: string; revisionUuid: string }): Promise<boolean>
  calculateRequiredRoleBasedOnRevisionDate(createdAt: Date): RoleName
}
