import 'reflect-metadata'

import { ValetTokenOperation } from '@standardnotes/security'
import { BadRequestErrorMessageResult } from 'inversify-express-utils/lib/results'
import { Result } from '@standardnotes/domain-core'
import { Logger } from 'winston'
import { Request, Response } from 'express'
import { Writable, Readable } from 'stream'
import { results } from 'inversify-express-utils'

import { CreateUploadSession } from '../../Domain/UseCase/CreateUploadSession/CreateUploadSession'
import { FinishUploadSession } from '../../Domain/UseCase/FinishUploadSession/FinishUploadSession'
import { StreamDownloadFile } from '../../Domain/UseCase/StreamDownloadFile/StreamDownloadFile'
import { UploadFileChunk } from '../../Domain/UseCase/UploadFileChunk/UploadFileChunk'
import { AnnotatedFilesController } from './AnnotatedFilesController'
import { GetFileMetadata } from '../../Domain/UseCase/GetFileMetadata/GetFileMetadata'
import { RemoveFile } from '../../Domain/UseCase/RemoveFile/RemoveFile'

describe('AnnotatedFilesController', () => {
  let uploadFileChunk: UploadFileChunk
  let createUploadSession: CreateUploadSession
  let finishUploadSession: FinishUploadSession
  let streamDownloadFile: StreamDownloadFile
  let getFileMetadata: GetFileMetadata
  let removeFile: RemoveFile
  let request: Request
  let response: Response
  let readStream: Readable
  const maxChunkBytes = 100_000
  let logger: Logger

  const createController = () =>
    new AnnotatedFilesController(
      uploadFileChunk,
      createUploadSession,
      finishUploadSession,
      streamDownloadFile,
      getFileMetadata,
      removeFile,
      maxChunkBytes,
      logger,
    )

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    readStream = {} as jest.Mocked<Readable>
    readStream.pipe = jest.fn().mockReturnValue(new Writable())

    streamDownloadFile = {} as jest.Mocked<StreamDownloadFile>
    streamDownloadFile.execute = jest.fn().mockReturnValue({ success: true, readStream })

    uploadFileChunk = {} as jest.Mocked<UploadFileChunk>
    uploadFileChunk.execute = jest.fn().mockReturnValue({ success: true })

    createUploadSession = {} as jest.Mocked<CreateUploadSession>
    createUploadSession.execute = jest.fn().mockReturnValue({ success: true, uploadId: '123' })

    finishUploadSession = {} as jest.Mocked<FinishUploadSession>
    finishUploadSession.execute = jest.fn().mockReturnValue(Result.ok())

    getFileMetadata = {} as jest.Mocked<GetFileMetadata>
    getFileMetadata.execute = jest.fn().mockReturnValue({ success: true, size: 555_555 })

    removeFile = {} as jest.Mocked<RemoveFile>
    removeFile.execute = jest.fn().mockReturnValue(Result.ok())

    request = {
      body: {},
      headers: {},
    } as jest.Mocked<Request>
    response = {
      locals: {},
    } as jest.Mocked<Response>
    response.locals.userUuid = '1-2-3'
    response.locals.permittedResources = [
      {
        remoteIdentifier: '2-3-4',
        unencryptedFileSize: 123,
      },
    ]
    response.writeHead = jest.fn()
  })

  it('should return a writable stream upon file download', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    request.headers['range'] = 'bytes=0-'

    const result = (await createController().download(request, response)) as () => Writable

    expect(response.writeHead).toHaveBeenCalledWith(206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': 100000,
      'Content-Range': 'bytes 0-99999/555555',
      'Content-Type': 'application/octet-stream',
    })

    expect(result()).toBeInstanceOf(Writable)
  })

  it('should not allow download on invalid operation in the valet token', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Write

    request.headers['range'] = 'bytes=0-'

    const result = await createController().download(request, response)

    expect(result).toBeInstanceOf(BadRequestErrorMessageResult)
  })

  it('should return proper byte range on consecutive calls', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    request.headers['range'] = 'bytes=0-'
    ;(await createController().download(request, response)) as () => Writable

    request.headers['range'] = 'bytes=100000-'
    ;(await createController().download(request, response)) as () => Writable

    expect(response.writeHead).toHaveBeenNthCalledWith(1, 206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': 100000,
      'Content-Range': 'bytes 0-99999/555555',
      'Content-Type': 'application/octet-stream',
    })

    expect(response.writeHead).toHaveBeenNthCalledWith(2, 206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': 100000,
      'Content-Range': 'bytes 100000-199999/555555',
      'Content-Type': 'application/octet-stream',
    })
  })

  it('should return a writable stream with custom chunk size', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    request.headers['x-chunk-size'] = '50000'
    request.headers['range'] = 'bytes=0-'

    const result = (await createController().download(request, response)) as () => Writable

    expect(response.writeHead).toHaveBeenCalledWith(206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': 50000,
      'Content-Range': 'bytes 0-49999/555555',
      'Content-Type': 'application/octet-stream',
    })

    expect(result()).toBeInstanceOf(Writable)
  })

  it('should default to maximum chunk size if custom chunk size is too large', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    request.headers['x-chunk-size'] = '200000'
    request.headers['range'] = 'bytes=0-'

    const result = (await createController().download(request, response)) as () => Writable

    expect(response.writeHead).toHaveBeenCalledWith(206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': 100000,
      'Content-Range': 'bytes 0-99999/555555',
      'Content-Type': 'application/octet-stream',
    })

    expect(result()).toBeInstanceOf(Writable)
  })

  it('should not return a writable stream if bytes range is not provided', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    const httpResponse = await createController().download(request, response)

    expect(httpResponse).toBeInstanceOf(results.BadRequestErrorMessageResult)
  })

  it('should not return a writable stream if getting file metadata fails', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    request.headers['range'] = 'bytes=0-'

    getFileMetadata.execute = jest.fn().mockReturnValue({ success: false, message: 'error' })

    const httpResponse = await createController().download(request, response)

    expect(httpResponse).toBeInstanceOf(results.BadRequestErrorMessageResult)
  })

  it('should not return a writable stream if creating download stream fails', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    request.headers['range'] = 'bytes=0-'

    streamDownloadFile.execute = jest.fn().mockReturnValue({ success: false, message: 'error' })

    const httpResponse = await createController().download(request, response)

    expect(httpResponse).toBeInstanceOf(results.BadRequestErrorMessageResult)
  })

  it('should create an upload session', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Write

    await createController().startUpload(request, response)

    expect(createUploadSession.execute).toHaveBeenCalledWith({
      resourceRemoteIdentifier: '2-3-4',
      ownerUuid: '1-2-3',
    })
  })

  it('should not create an upload session on invalid operation in the valet token', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    const result = await createController().startUpload(request, response)

    expect(result).toBeInstanceOf(BadRequestErrorMessageResult)
  })

  it('should return bad request if upload session could not be created', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Write

    createUploadSession.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = await createController().startUpload(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should finish an upload session', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Write

    await createController().finishUpload(request, response)

    expect(finishUploadSession.execute).toHaveBeenCalledWith({
      resourceRemoteIdentifier: '2-3-4',
      userUuid: '1-2-3',
    })
  })

  it('should not finish an upload session on invalid operation in the valet token', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    const result = await createController().finishUpload(request, response)

    expect(result).toBeInstanceOf(BadRequestErrorMessageResult)
  })

  it('should return bad request if upload session could not be finished', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Write

    finishUploadSession.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    const httpResponse = await createController().finishUpload(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should remove a file', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Delete

    await createController().remove(request, response)

    expect(removeFile.execute).toHaveBeenCalledWith({
      userInput: {
        resourceRemoteIdentifier: '2-3-4',
        userUuid: '1-2-3',
      },
    })
  })

  it('should return bad request if file removal could not be completed', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Delete

    removeFile.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const httpResponse = await createController().remove(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should return bad request if file removal is not permitted on valet token', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    const httpResponse = await createController().remove(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should upload a chunk to an upload session', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Write

    request.headers['x-chunk-id'] = '2'
    request.body = Buffer.from([123])

    await createController().uploadChunk(request, response)

    expect(uploadFileChunk.execute).toHaveBeenCalledWith({
      chunkId: 2,
      data: Buffer.from([123]),
      resourceRemoteIdentifier: '2-3-4',
      resourceUnencryptedFileSize: 123,
      ownerUuid: '1-2-3',
    })
  })

  it('should return bad request if chunk could not be uploaded', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Write

    request.headers['x-chunk-id'] = '2'
    request.body = Buffer.from([123])
    uploadFileChunk.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = await createController().uploadChunk(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should return bad request if valet token is not permitted', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Read

    const httpResponse = await createController().uploadChunk(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should return bad request if chunk id is missing', async () => {
    response.locals.permittedOperation = ValetTokenOperation.Write

    request.body = Buffer.from([123])

    const httpResponse = await createController().uploadChunk(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })
})
