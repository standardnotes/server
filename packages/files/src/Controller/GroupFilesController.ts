import { BaseHttpController, controller, httpGet, results } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { Writable } from 'stream'
import TYPES from '../Bootstrap/Types'
import { StreamDownloadFile } from '../Domain/UseCase/StreamDownloadFile/StreamDownloadFile'
import { GetFileMetadata } from '../Domain/UseCase/GetFileMetadata/GetFileMetadata'
import { GroupValetTokenData, ValetTokenOperation } from '@standardnotes/security'

@controller('/v1/groups/files', TYPES.GroupValetTokenAuthMiddleware)
export class GroupFilesController extends BaseHttpController {
  constructor(
    @inject(TYPES.StreamDownloadFile) private streamDownloadFile: StreamDownloadFile,
    @inject(TYPES.GetFileMetadata) private getFileMetadata: GetFileMetadata,
    @inject(TYPES.MAX_CHUNK_BYTES) private maxChunkBytes: number,
  ) {
    super()
  }

  @httpGet('/')
  async download(
    request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | (() => Writable)> {
    if (response.locals.permittedOperation !== ValetTokenOperation.Read) {
      return this.badRequest('Not permitted for this operation')
    }

    const range = request.headers['range']
    if (!range) {
      return this.badRequest('File download requires range header to be set.')
    }

    let chunkSize = +(request.headers['x-chunk-size'] as string)
    if (!chunkSize || chunkSize > this.maxChunkBytes) {
      chunkSize = this.maxChunkBytes
    }

    const locals = response.locals as GroupValetTokenData

    const fileMetadata = await this.getFileMetadata.execute({
      userUuid: locals.fileOwnerUuid,
      resourceRemoteIdentifier: locals.remoteIdentifier,
    })

    if (!fileMetadata.success) {
      return this.badRequest(fileMetadata.message)
    }

    const startRange = Number(range.replace(/\D/g, ''))
    const endRange = Math.min(startRange + chunkSize - 1, fileMetadata.size - 1)

    const headers = {
      'Content-Range': `bytes ${startRange}-${endRange}/${fileMetadata.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': endRange - startRange + 1,
      'Content-Type': 'application/octet-stream',
    }

    response.writeHead(206, headers)

    const result = await this.streamDownloadFile.execute({
      userUuid: locals.fileOwnerUuid,
      resourceRemoteIdentifier: locals.remoteIdentifier,
      startRange,
      endRange,
    })

    if (!result.success) {
      return this.badRequest(result.message)
    }

    return () => result.readStream.pipe(response)
  }
}
