import { ChunkId } from '../Upload/ChunkId'
import { UploadChunkResult } from '../Upload/UploadChunkResult'
import { UploadId } from '../Upload/UploadId'

export interface FileUploaderInterface {
  createUploadSession(filePath: string): Promise<UploadId>
  uploadFileChunk(dto: {
    uploadId: string
    data: Uint8Array
    filePath: string
    chunkId: ChunkId
    unencryptedFileSize: number
  }): Promise<string>
  finishUploadSession(uploadId: string, filePath: string, uploadChunkResults: Array<UploadChunkResult>): Promise<void>
}
