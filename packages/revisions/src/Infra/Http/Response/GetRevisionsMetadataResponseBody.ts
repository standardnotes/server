import { RevisionMetadata } from '../../../Domain/Revision/RevisionMetadata'

export interface GetRevisionsMetadataResponseBody {
  revisions: Array<RevisionMetadata>
}
