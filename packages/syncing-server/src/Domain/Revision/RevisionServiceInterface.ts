import { Revision } from './Revision'
import { RevisionMetadata } from './RevisionMetadata'

export interface RevisionServiceInterface {
  getRevisionsMetadata(userUuid: string, itemUuid: string): Promise<RevisionMetadata[]>
  getRevision(dto: {
    userUuid: string
    userRoles: string[]
    itemUuid: string
    revisionUuid: string
  }): Promise<Revision | null>
  removeRevision(dto: { userUuid: string; itemUuid: string; revisionUuid: string }): Promise<boolean>
  calculateRequiredRoleBasedOnRevisionDate(createdAt: Date): string
}
