import { ChunkId } from './ChunkId'

export type UploadChunkResult = {
  chunkId: ChunkId
  tag: string
  chunkSize: number
}
