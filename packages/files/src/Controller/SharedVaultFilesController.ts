import { BaseHttpController, controller, httpDelete, httpGet, httpPost, results } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { Writable } from 'stream'
import TYPES from '../Bootstrap/Types'
import { UploadFileChunk } from '../Domain/UseCase/UploadFileChunk/UploadFileChunk'
import { StreamDownloadFile } from '../Domain/UseCase/StreamDownloadFile/StreamDownloadFile'
import { CreateUploadSession } from '../Domain/UseCase/CreateUploadSession/CreateUploadSession'
import { FinishUploadSession } from '../Domain/UseCase/FinishUploadSession/FinishUploadSession'
import { GetFileMetadata } from '../Domain/UseCase/GetFileMetadata/GetFileMetadata'
import { RemoveFile } from '../Domain/UseCase/RemoveFile/RemoveFile'
import { ValetTokenOperation, SharedVaultValetTokenData } from '@standardnotes/security'
import { MoveFile } from '../Domain/UseCase/MoveFile/MoveFile'

@controller('/v1/shared-vault/files', TYPES.SharedVaultValetTokenAuthMiddleware)
export class SharedVaultFilesController extends BaseHttpController {
  constructor(
    @inject(TYPES.UploadFileChunk) private uploadFileChunk: UploadFileChunk,
    @inject(TYPES.CreateUploadSession) private createUploadSession: CreateUploadSession,
    @inject(TYPES.FinishUploadSession) private finishUploadSession: FinishUploadSession,
    @inject(TYPES.StreamDownloadFile) private streamDownloadFile: StreamDownloadFile,
    @inject(TYPES.GetFileMetadata) private getFileMetadata: GetFileMetadata,
    @inject(TYPES.RemoveFile) private removeFile: RemoveFile,
    @inject(TYPES.MoveFile) private moveFile: MoveFile,
    @inject(TYPES.MAX_CHUNK_BYTES) private maxChunkBytes: number,
  ) {
    super()
  }

  @httpPost('/move')
  async moveFileRequest(
    _request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | results.JsonResult> {
    const locals = response.locals as SharedVaultValetTokenData
    if (locals.permittedOperation !== ValetTokenOperation.Move) {
      return this.badRequest('Not permitted for this operation')
    }

    const moveOperation = locals.moveOperation
    if (!moveOperation) {
      return this.badRequest('Missing move operation data')
    }

    const result = await this.moveFile.execute({
      moveType: moveOperation.type,
      fromUuid: moveOperation.fromUuid,
      toUuid: moveOperation.toUuid,
      resourceRemoteIdentifier: locals.remoteIdentifier,
    })

    if (!result.success) {
      return this.badRequest(result.message)
    }

    return this.json({ success: true })
  }

  @httpPost('/upload/create-session')
  async startUpload(
    _request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | results.JsonResult> {
    const locals = response.locals as SharedVaultValetTokenData
    if (locals.permittedOperation !== ValetTokenOperation.Write) {
      return this.badRequest('Not permitted for this operation')
    }

    const result = await this.createUploadSession.execute({
      ownerUuid: locals.sharedVaultUuid,
      resourceRemoteIdentifier: locals.remoteIdentifier,
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
    const locals = response.locals as SharedVaultValetTokenData
    if (locals.permittedOperation !== ValetTokenOperation.Write) {
      return this.badRequest('Not permitted for this operation')
    }

    const chunkId = +(request.headers['x-chunk-id'] as string)
    if (!chunkId) {
      return this.badRequest('Missing x-chunk-id header in request.')
    }

    const result = await this.uploadFileChunk.execute({
      ownerUuid: locals.sharedVaultUuid,
      resourceRemoteIdentifier: locals.remoteIdentifier,
      resourceUnencryptedFileSize: locals.unencryptedFileSize as number,
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
    const locals = response.locals as SharedVaultValetTokenData
    if (locals.permittedOperation !== ValetTokenOperation.Write) {
      return this.badRequest('Not permitted for this operation')
    }

    const result = await this.finishUploadSession.execute({
      ownerUuid: locals.sharedVaultUuid,
      ownerType: 'shared-vault',
      resourceRemoteIdentifier: locals.remoteIdentifier,
      uploadBytesLimit: locals.uploadBytesLimit,
      uploadBytesUsed: locals.uploadBytesUsed,
    })

    if (!result.success) {
      return this.badRequest(result.message)
    }

    return this.json({ success: true, message: 'File uploaded successfully' })
  }

  @httpDelete('/')
  async remove(
    _request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | results.JsonResult> {
    const locals = response.locals as SharedVaultValetTokenData
    if (locals.permittedOperation !== ValetTokenOperation.Delete) {
      return this.badRequest('Not permitted for this operation')
    }

    const result = await this.removeFile.execute({
      sharedVaultUuid: locals.sharedVaultUuid,
      resourceRemoteIdentifier: locals.remoteIdentifier,
    })

    if (!result.success) {
      return this.badRequest(result.message)
    }

    return this.json({ success: true, message: 'File removed successfully' })
  }

  @httpGet('/')
  async download(
    request: Request,
    response: Response,
  ): Promise<results.BadRequestErrorMessageResult | (() => Writable)> {
    const locals = response.locals as SharedVaultValetTokenData
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

    const fileMetadata = await this.getFileMetadata.execute({
      ownerUuid: locals.sharedVaultUuid,
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
      ownerUuid: locals.sharedVaultUuid,
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
