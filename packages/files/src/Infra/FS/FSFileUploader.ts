import { promises } from 'fs'
import { dirname } from 'path'
import { inject, injectable } from 'inversify'

import { FileUploaderInterface } from '../../Domain/Services/FileUploaderInterface'
import { UploadChunkResult } from '../../Domain/Upload/UploadChunkResult'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'

@injectable()
export class FSFileUploader implements FileUploaderInterface {
  private inMemoryChunks: Map<string, Map<number, Uint8Array>>

  constructor(
    @inject(TYPES.FILE_UPLOAD_PATH) private fileUploadPath: string,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    this.inMemoryChunks = new Map<string, Map<number, Uint8Array>>()
  }

  async uploadFileChunk(dto: {
    uploadId: string
    data: Uint8Array
    filePath: string
    chunkId: number
  }): Promise<string> {
    if (!this.inMemoryChunks.has(dto.uploadId)) {
      this.inMemoryChunks.set(dto.uploadId, new Map<number, Uint8Array>())
    }

    const fileChunks = this.inMemoryChunks.get(dto.uploadId) as Map<number, Uint8Array>

    this.logger.debug(`FS storing file chunk ${dto.chunkId} in memory for ${dto.uploadId}`)

    fileChunks.set(dto.chunkId, dto.data)

    return dto.uploadId
  }

  async finishUploadSession(
    uploadId: string,
    filePath: string,
    _uploadChunkResults: UploadChunkResult[],
  ): Promise<void> {
    this.logger.debug(`FS finishing upload for ${uploadId}`)

    const fileChunks = this.inMemoryChunks.get(uploadId)
    if (!fileChunks) {
      throw new Error(`Could not find chunks for upload ${uploadId}`)
    }

    const orderedKeys = [...fileChunks.keys()].sort((a, b) => a - b)
    for (const orderedKey of orderedKeys) {
      await promises.appendFile(`${this.fileUploadPath}/${filePath}`, fileChunks.get(orderedKey) as Uint8Array)
    }

    this.inMemoryChunks.delete(uploadId)
  }

  async createUploadSession(filePath: string): Promise<string> {
    const fullPath = `${this.fileUploadPath}/${filePath}`

    await promises.mkdir(dirname(fullPath), { recursive: true })

    return fullPath
  }
}
