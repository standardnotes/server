import { promises } from 'fs'
import { dirname } from 'path'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import { FileUploaderInterface } from '../../Domain/Services/FileUploaderInterface'
import { UploadChunkResult } from '../../Domain/Upload/UploadChunkResult'
import TYPES from '../../Bootstrap/Types'
import { ChunkId } from '../../Domain/Upload/ChunkId'

@injectable()
export class FSFileUploader implements FileUploaderInterface {
  private inMemoryChunks: Map<string, Map<number, Uint8Array>>

  constructor(
    @inject(TYPES.Files_FILE_UPLOAD_PATH) private fileUploadPath: string,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {
    this.inMemoryChunks = new Map<string, Map<number, Uint8Array>>()
  }

  async uploadFileChunk(dto: {
    uploadId: string
    data: Uint8Array
    filePath: string
    chunkId: ChunkId
    unencryptedFileSize: number
  }): Promise<string> {
    if (!this.inMemoryChunks.has(dto.uploadId)) {
      this.inMemoryChunks.set(dto.uploadId, new Map<number, Uint8Array>())
    }

    const fileChunks = this.inMemoryChunks.get(dto.uploadId) as Map<number, Uint8Array>

    const alreadyStoredBytes = this.accumulatedEncryptedFileSize(fileChunks)
    if (alreadyStoredBytes >= dto.unencryptedFileSize) {
      throw new Error(
        `Could not finish chunk upload. Accumulated encrypted file size (${alreadyStoredBytes}B) already exceeds the unecrypted file size: ${dto.unencryptedFileSize}`,
      )
    }

    this.logger.debug(
      `FS storing file chunk ${dto.chunkId} in memory for ${dto.uploadId}: ${dto.data}, ${dto.data.byteLength}`,
    )

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
      const chunk = fileChunks.get(orderedKey)
      if (!chunk || chunk.byteLength === 0) {
        throw new Error(`Could not find chunk ${orderedKey} for upload ${uploadId}`)
      }

      this.logger.debug(`FS writing chunk ${orderedKey} for ${uploadId}: ${chunk.toString()} ${chunk.byteLength}}`)

      await promises.appendFile(`${this.fileUploadPath}/${filePath}`, chunk)
    }

    this.inMemoryChunks.delete(uploadId)
  }

  async createUploadSession(filePath: string): Promise<string> {
    const fullPath = `${this.fileUploadPath}/${filePath}`

    await promises.mkdir(dirname(fullPath), { recursive: true })

    return fullPath
  }

  private accumulatedEncryptedFileSize(fileChunks: Map<number, Uint8Array>): number {
    let accumulatedSize = 0

    for (const value of fileChunks.values()) {
      accumulatedSize += value.byteLength
    }

    return accumulatedSize
  }
}
