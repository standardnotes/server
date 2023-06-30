import { ChunkId } from '../../Upload/ChunkId'

export type UploadFileChunkDTO = {
  data: Uint8Array
  chunkId: ChunkId
  ownerUuid: string
  resourceRemoteIdentifier: string
  resourceUnencryptedFileSize: number
}
