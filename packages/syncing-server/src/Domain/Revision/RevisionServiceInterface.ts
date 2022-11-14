import { RoleName } from '@standardnotes/common'
import { Item } from '../Item/Item'
import { Revision } from './Revision'
import { RevisionMetadata } from './RevisionMetadata'

export interface RevisionServiceInterface {
  createRevision(item: Item): Promise<void>
  copyRevisions(fromItemUuid: string, toItemUuid: string): Promise<void>
  getRevisionsMetadata(userUuid: string, itemUuid: string): Promise<RevisionMetadata[]>
  getRevision(dto: {
    userUuid: string
    userRoles: RoleName[]
    itemUuid: string
    revisionUuid: string
  }): Promise<Revision | null>
  removeRevision(dto: { userUuid: string; itemUuid: string; revisionUuid: string }): Promise<boolean>
  calculateRequiredRoleBasedOnRevisionDate(createdAt: Date): RoleName
}
