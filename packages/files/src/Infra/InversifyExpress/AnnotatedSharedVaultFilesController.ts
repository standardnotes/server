import { BaseHttpController, controller, httpDelete, httpGet, httpPost, results } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { Writable } from 'stream'
import { ValetTokenOperation } from '@standardnotes/security'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { CreateUploadSession } from '../../Domain/UseCase/CreateUploadSession/CreateUploadSession'
import { FinishUploadSession } from '../../Domain/UseCase/FinishUploadSession/FinishUploadSession'
import { GetFileMetadata } from '../../Domain/UseCase/GetFileMetadata/GetFileMetadata'
import { MoveFile } from '../../Domain/UseCase/MoveFile/MoveFile'
import { RemoveFile } from '../../Domain/UseCase/RemoveFile/RemoveFile'
import { StreamDownloadFile } from '../../Domain/UseCase/StreamDownloadFile/StreamDownloadFile'
import { UploadFileChunk } from '../../Domain/UseCase/UploadFileChunk/UploadFileChunk'
import { SharedVaultValetTokenResponseLocals } from './Middleware/SharedVaultValetTokenResponseLocals'

@controller('/v1/shared-vault/files', TYPES.Files_SharedVaultValetTokenAuthMiddleware)
export class AnnotatedSharedVaultFilesController extends BaseHttpController {
  constructor(
    @inject(TYPES.Files_UploadFileChunk) private uploadFileChunk: UploadFileChunk,
    @inject(TYPES.Files_CreateUploadSession) private createUploadSession: CreateUploadSession,
    @inject(TYPES.Files_FinishUploadSession) private finishUploadSession: FinishUploadSession,
    @inject(TYPES.Files_StreamDownloadFile) private streamDownloadFile: StreamDownloadFile,
    @inject(TYPES.Files_GetFileMetadata) private getFileMetadata: GetFileMetadata,
    @inject(TYPES.Files_RemoveFile) private removeFile: RemoveFile,
    @inject(TYPES.Files_MoveFile) private moveFile: MoveFile,
    @inject(TYPES.Files_MAX_CHUNK_BYTES) private maxChunkBytes: number,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {
    super()
  }

  @httpPost('/move')
  async moveFileRequest(
    _request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | results.JsonResult> {
    const locals = response.locals as SharedVaultValetTokenResponseLocals
    if (locals.valetTokenData.permittedOperation !== ValetTokenOperation.Move) {
      return this.badRequest('Not permitted for this operation')
    }

    const moveOperation = locals.valetTokenData.moveOperation
    if (!moveOperation) {
      return this.badRequest('Missing move operation data')
    }

    const result = await this.moveFile.execute({
      moveType: moveOperation.type,
      from: moveOperation.from,
      to: moveOperation.to,
      resourceRemoteIdentifier: locals.valetTokenData.remoteIdentifier,
    })

    if (result.isFailed()) {
      return this.badRequest(result.getError())
    }

    return this.json({ success: true })
  }

  @httpPost('/upload/create-session')
  async startUpload(
    _request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | results.JsonResult> {
    const locals = response.locals as SharedVaultValetTokenResponseLocals
    if (locals.valetTokenData.permittedOperation !== ValetTokenOperation.Write) {
      return this.badRequest('Not permitted for this operation')
    }

    const result = await this.createUploadSession.execute({
      ownerUuid: locals.valetTokenData.sharedVaultUuid,
      resourceRemoteIdentifier: locals.valetTokenData.remoteIdentifier,
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
    const locals = response.locals as SharedVaultValetTokenResponseLocals
    if (locals.valetTokenData.permittedOperation !== ValetTokenOperation.Write) {
      return this.badRequest('Not permitted for this operation')
    }

    const chunkId = +(request.headers['x-chunk-id'] as string)
    if (!chunkId) {
      return this.badRequest('Missing x-chunk-id header in request.')
    }

    const result = await this.uploadFileChunk.execute({
      ownerUuid: locals.valetTokenData.sharedVaultUuid,
      resourceRemoteIdentifier: locals.valetTokenData.remoteIdentifier,
      resourceUnencryptedFileSize: locals.valetTokenData.unencryptedFileSize as number,
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
    const locals = response.locals as SharedVaultValetTokenResponseLocals
    if (locals.valetTokenData.permittedOperation !== ValetTokenOperation.Write) {
      return this.badRequest('Not permitted for this operation')
    }

    if (locals.valetTokenData.uploadBytesLimit === undefined) {
      return this.badRequest('Missing upload bytes limit')
    }

    const result = await this.finishUploadSession.execute({
      userUuid: locals.valetTokenData.vaultOwnerUuid,
      sharedVaultUuid: locals.valetTokenData.sharedVaultUuid,
      resourceRemoteIdentifier: locals.valetTokenData.remoteIdentifier,
      uploadBytesLimit: locals.valetTokenData.uploadBytesLimit,
      uploadBytesUsed: locals.valetTokenData.uploadBytesUsed,
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
    const locals = response.locals as SharedVaultValetTokenResponseLocals
    if (locals.valetTokenData.permittedOperation !== ValetTokenOperation.Delete) {
      return this.badRequest('Not permitted for this operation')
    }

    const result = await this.removeFile.execute({
      vaultInput: {
        sharedVaultUuid: locals.valetTokenData.sharedVaultUuid,
        vaultOwnerUuid: locals.valetTokenData.vaultOwnerUuid,
        resourceRemoteIdentifier: locals.valetTokenData.remoteIdentifier,
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
    const locals = response.locals as SharedVaultValetTokenResponseLocals
    if (locals.valetTokenData.permittedOperation !== ValetTokenOperation.Read) {
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
      ownerUuid: locals.valetTokenData.sharedVaultUuid,
      resourceRemoteIdentifier: locals.valetTokenData.remoteIdentifier,
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
      ownerUuid: locals.valetTokenData.sharedVaultUuid,
      resourceRemoteIdentifier: locals.valetTokenData.remoteIdentifier,
      startRange,
      endRange,
      valetToken: locals.valetToken,
      endRangeOfFile,
    })

    if (!result.success) {
      return this.badRequest(result.message)
    }

    return () => result.readStream.pipe(response)
  }
}
