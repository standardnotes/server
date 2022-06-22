import * as IORedis from 'ioredis'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { UploadRepositoryInterface } from '../../Domain/Upload/UploadRepositoryInterface'
import { UploadChunkResult } from '../../Domain/Upload/UploadChunkResult'

@injectable()
export class RedisUploadRepository implements UploadRepositoryInterface {
  private readonly UPLOAD_SESSION_PREFIX = 'upload-session'
  private readonly UPLOAD_CHUNKS_PREFIX = 'upload-chunks'
  private readonly UPLOAD_SESSION_DEFAULT_TTL = 7200

  constructor(@inject(TYPES.Redis) private redisClient: IORedis.Redis) {}

  async storeUploadSession(filePath: string, uploadId: string): Promise<void> {
    await this.redisClient.setex(`${this.UPLOAD_SESSION_PREFIX}:${filePath}`, this.UPLOAD_SESSION_DEFAULT_TTL, uploadId)
  }

  async retrieveUploadSessionId(filePath: string): Promise<string | undefined> {
    const uploadId = await this.redisClient.get(`${this.UPLOAD_SESSION_PREFIX}:${filePath}`)
    if (!uploadId) {
      return undefined
    }

    return uploadId
  }

  async storeUploadChunkResult(uploadId: string, uploadChunkResult: UploadChunkResult): Promise<void> {
    await this.redisClient.lpush(`${this.UPLOAD_CHUNKS_PREFIX}:${uploadId}`, JSON.stringify(uploadChunkResult))
    await this.redisClient.expire(`${this.UPLOAD_CHUNKS_PREFIX}:${uploadId}`, this.UPLOAD_SESSION_DEFAULT_TTL)
  }

  async retrieveUploadChunkResults(uploadId: string): Promise<UploadChunkResult[]> {
    const stringifiedUploadChunkResults = await this.redisClient.lrange(
      `${this.UPLOAD_CHUNKS_PREFIX}:${uploadId}`,
      0,
      -1,
    )
    const uploadChunksResults: UploadChunkResult[] = []
    for (const stringifiedUploadChunkResult of stringifiedUploadChunkResults) {
      uploadChunksResults.push(JSON.parse(stringifiedUploadChunkResult))
    }

    const sortedResults = uploadChunksResults.sort((a, b) => {
      return a.chunkId - b.chunkId
    })

    return sortedResults
  }
}
