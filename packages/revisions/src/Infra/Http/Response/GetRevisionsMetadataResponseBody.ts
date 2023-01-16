export interface GetRevisionsMetadataResponseBody {
  revisions: Array<{
    uuid: string
    contentType: string
    createdAt: string
    updatedAt: string
  }>
}
