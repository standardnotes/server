import { UploadChunkResult } from './UploadChunkResult'
import { UploadId } from './UploadId'

export interface UploadRepositoryInterface {
  storeUploadSession(filePath: string, uploadId: UploadId): Promise<void>
  retrieveUploadSessionId(filePath: string): Promise<UploadId | undefined>
  storeUploadChunkResult(uploadId: UploadId, uploadChunkResult: UploadChunkResult): Promise<void>
  retrieveUploadChunkResults(uploadId: UploadId): Promise<Array<UploadChunkResult>>
}
