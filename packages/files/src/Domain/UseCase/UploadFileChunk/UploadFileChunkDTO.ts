import { ChunkId } from '../../Upload/ChunkId'

export type UploadFileChunkDTO = {
  data: Uint8Array
  chunkId: ChunkId
  userUuid: string
  resourceRemoteIdentifier: string
}
