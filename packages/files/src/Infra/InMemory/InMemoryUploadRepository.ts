import { TimerInterface } from '@standardnotes/time'

import { UploadRepositoryInterface } from '../../Domain/Upload/UploadRepositoryInterface'
import { UploadChunkResult } from '../../Domain/Upload/UploadChunkResult'

export class InMemoryUploadRepository implements UploadRepositoryInterface {
  private readonly UPLOAD_SESSION_PREFIX = 'upload-session'
  private readonly UPLOAD_CHUNKS_PREFIX = 'upload-chunks'
  private readonly UPLOAD_SESSION_DEFAULT_TTL = 7200

  private inMemoryUploadCacheMap: Map<string, string> = new Map()
  private inMemoryUploadTTLMap: Map<string, number> = new Map()

  constructor(private timer: TimerInterface) {}

  async storeUploadSession(filePath: string, uploadId: string): Promise<void> {
    this.inMemoryUploadCacheMap.set(`${this.UPLOAD_SESSION_PREFIX}:${filePath}`, uploadId)
    this.inMemoryUploadTTLMap.set(
      `${this.UPLOAD_SESSION_PREFIX}:${filePath}`,
      +this.timer.getUTCDateNSecondsAhead(this.UPLOAD_SESSION_DEFAULT_TTL) / 1000,
    )
  }

  async retrieveUploadSessionId(filePath: string): Promise<string | undefined> {
    this.invalidateStaleUploads()

    return this.inMemoryUploadCacheMap.get(`${this.UPLOAD_SESSION_PREFIX}:${filePath}`)
  }

  async storeUploadChunkResult(uploadId: string, uploadChunkResult: UploadChunkResult): Promise<void> {
    this.invalidateStaleUploads()

    let uploadResults = []
    const uploadResultsJSON = this.inMemoryUploadCacheMap.get(`${this.UPLOAD_CHUNKS_PREFIX}:${uploadId}`)
    if (uploadResultsJSON) {
      uploadResults = JSON.parse(uploadResultsJSON)
    }
    uploadResults.unshift(JSON.stringify(uploadChunkResult))

    this.inMemoryUploadCacheMap.set(`${this.UPLOAD_CHUNKS_PREFIX}:${uploadId}`, JSON.stringify(uploadResults))
    this.inMemoryUploadTTLMap.set(
      `${this.UPLOAD_CHUNKS_PREFIX}:${uploadId}`,
      +this.timer.getUTCDateNSecondsAhead(this.UPLOAD_SESSION_DEFAULT_TTL) / 1000,
    )
  }

  async retrieveUploadChunkResults(uploadId: string): Promise<UploadChunkResult[]> {
    this.invalidateStaleUploads()

    let uploadResults = []
    const uploadResultsJSON = this.inMemoryUploadCacheMap.get(`${this.UPLOAD_CHUNKS_PREFIX}:${uploadId}`)
    if (uploadResultsJSON) {
      uploadResults = JSON.parse(uploadResultsJSON)
    }

    const uploadChunksResults: UploadChunkResult[] = []
    for (const stringifiedUploadChunkResult of uploadResults) {
      uploadChunksResults.push(JSON.parse(stringifiedUploadChunkResult))
    }

    const sortedResults = uploadChunksResults.sort((a, b) => {
      return a.chunkId - b.chunkId
    })

    return sortedResults
  }

  private invalidateStaleUploads(): void {
    const now = this.timer.getTimestampInSeconds()
    for (const [key, value] of this.inMemoryUploadTTLMap.entries()) {
      if (value < now) {
        this.inMemoryUploadCacheMap.delete(key)
        this.inMemoryUploadTTLMap.delete(key)
      }
    }
  }
}
