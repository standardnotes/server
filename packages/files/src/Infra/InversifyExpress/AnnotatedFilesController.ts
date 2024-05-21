import { BaseHttpController, controller, httpDelete, httpGet, httpPost, results } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { Writable } from 'stream'
import { ValetTokenOperation } from '@standardnotes/security'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { UploadFileChunk } from '../../Domain/UseCase/UploadFileChunk/UploadFileChunk'
import { StreamDownloadFile } from '../../Domain/UseCase/StreamDownloadFile/StreamDownloadFile'
import { CreateUploadSession } from '../../Domain/UseCase/CreateUploadSession/CreateUploadSession'
import { FinishUploadSession } from '../../Domain/UseCase/FinishUploadSession/FinishUploadSession'
import { GetFileMetadata } from '../../Domain/UseCase/GetFileMetadata/GetFileMetadata'
import { RemoveFile } from '../../Domain/UseCase/RemoveFile/RemoveFile'
import { ValetTokenResponseLocals } from './Middleware/ValetTokenResponseLocals'

@controller('/v1/files', TYPES.Files_ValetTokenAuthMiddleware)
export class AnnotatedFilesController extends BaseHttpController {
  constructor(
    @inject(TYPES.Files_UploadFileChunk) private uploadFileChunk: UploadFileChunk,
    @inject(TYPES.Files_CreateUploadSession) private createUploadSession: CreateUploadSession,
    @inject(TYPES.Files_FinishUploadSession) private finishUploadSession: FinishUploadSession,
    @inject(TYPES.Files_StreamDownloadFile) private streamDownloadFile: StreamDownloadFile,
    @inject(TYPES.Files_GetFileMetadata) private getFileMetadata: GetFileMetadata,
    @inject(TYPES.Files_RemoveFile) private removeFile: RemoveFile,
    @inject(TYPES.Files_MAX_CHUNK_BYTES) private maxChunkBytes: number,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {
    super()
  }

  @httpPost('/upload/create-session')
  async startUpload(
    _request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | results.JsonResult> {
    if (response.locals.permittedOperation !== ValetTokenOperation.Write) {
      return this.badRequest('Not permitted for this operation')
    }

    const result = await this.createUploadSession.execute({
      ownerUuid: response.locals.userUuid,
      resourceRemoteIdentifier: response.locals.permittedResources[0].remoteIdentifier,
    })

    if (!result.success) {
      return this.badRequest(result.message)
    }

    return this.json({ success: true, uploadId: result.uploadId })
  }

  @httpPost('/upload/chunk')
  async uploadChunk(
    request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | results.JsonResult> {
    if (response.locals.permittedOperation !== ValetTokenOperation.Write) {
      return this.badRequest('Not permitted for this operation')
    }

    const chunkId = +(request.headers['x-chunk-id'] as string)
    if (!chunkId) {
      return this.badRequest('Missing x-chunk-id header in request.')
    }

    const result = await this.uploadFileChunk.execute({
      ownerUuid: response.locals.userUuid,
      resourceRemoteIdentifier: response.locals.permittedResources[0].remoteIdentifier,
      resourceUnencryptedFileSize: response.locals.permittedResources[0].unencryptedFileSize,
      chunkId,
      data: request.body,
    })

    if (!result.success) {
      return this.badRequest(result.message)
    }

    return this.json({ success: true, message: 'Chunk uploaded successfully' })
  }

  @httpPost('/upload/close-session')
  public async finishUpload(
    _request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | results.JsonResult> {
    const locals = response.locals as ValetTokenResponseLocals
    if (locals.permittedOperation !== ValetTokenOperation.Write) {
      return this.badRequest('Not permitted for this operation')
    }

    const result = await this.finishUploadSession.execute({
      userUuid: locals.userUuid,
      resourceRemoteIdentifier: locals.permittedResources[0].remoteIdentifier,
      uploadBytesLimit: locals.uploadBytesLimit,
      uploadBytesUsed: locals.uploadBytesUsed,
      valetToken: locals.valetToken,
    })

    if (result.isFailed()) {
      this.logger.error(result.getError())

      return this.badRequest(result.getError())
    }

    return this.json({ success: true, message: 'File uploaded successfully' })
  }

  @httpDelete('/')
  async remove(
    _request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | results.JsonResult> {
    const locals = response.locals as ValetTokenResponseLocals
    if (locals.permittedOperation !== ValetTokenOperation.Delete) {
      return this.badRequest('Not permitted for this operation')
    }

    const result = await this.removeFile.execute({
      userInput: {
        userUuid: locals.userUuid,
        resourceRemoteIdentifier: locals.permittedResources[0].remoteIdentifier,
        regularSubscriptionUuid: locals.regularSubscriptionUuid,
      },
      valetToken: locals.valetToken,
    })

    if (result.isFailed()) {
      return this.badRequest(result.getError())
    }

    return this.json({ success: true, message: 'File removed successfully' })
  }

  @httpGet('/')
  async download(
    request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | (() => Writable)> {
    const locals = response.locals as ValetTokenResponseLocals
    if (locals.permittedOperation !== ValetTokenOperation.Read) {
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

    const fileMetadataOrError = await this.getFileMetadata.execute({
      ownerUuid: locals.userUuid,
      resourceRemoteIdentifier: locals.permittedResources[0].remoteIdentifier,
    })

    if (fileMetadataOrError.isFailed()) {
      return this.badRequest(fileMetadataOrError.getError())
    }
    const fileSize = fileMetadataOrError.getValue()
    const endRangeOfFile = fileSize - 1

    const startRange = Number(range.replace(/\D/g, ''))
    const endRange = Math.min(startRange + chunkSize - 1, endRangeOfFile)

    const headers = {
      'Content-Range': `bytes ${startRange}-${endRange}/${endRangeOfFile}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': endRange - startRange + 1,
      'Content-Type': 'application/octet-stream',
    }

    response.writeHead(206, headers)

    const result = await this.streamDownloadFile.execute({
      ownerUuid: locals.userUuid,
      resourceRemoteIdentifier: locals.permittedResources[0].remoteIdentifier,
      startRange,
      endRange,
      endRangeOfFile,
      valetToken: locals.valetToken,
    })

    if (!result.success) {
      return this.badRequest(result.message)
    }

    return () => result.readStream.pipe(response)
  }
}
