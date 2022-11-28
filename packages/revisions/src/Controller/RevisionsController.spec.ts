import { Result } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { DeleteRevision } from '../Domain/UseCase/DeleteRevision/DeleteRevision'
import { GetRevision } from '../Domain/UseCase/GetRevision/GetRevision'
import { GetRevisionsMetada } from '../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'

import { RevisionsController } from './RevisionsController'

describe('RevisionsController', () => {
  let getRevisionsMetadata: GetRevisionsMetada
  let getRevision: GetRevision
  let deleteRevision: DeleteRevision
  let logger: Logger

  const createController = () => new RevisionsController(getRevisionsMetadata, getRevision, deleteRevision, logger)

  beforeEach(() => {
    getRevisionsMetadata = {} as jest.Mocked<GetRevisionsMetada>
    getRevisionsMetadata.execute = jest.fn().mockReturnValue(Result.ok())

    getRevision = {} as jest.Mocked<GetRevision>
    getRevision.execute = jest.fn().mockReturnValue(Result.ok())

    deleteRevision = {} as jest.Mocked<DeleteRevision>
    deleteRevision.execute = jest.fn().mockReturnValue(Result.ok())

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()
  })

  it('should get revisions list', async () => {
    const response = await createController().getRevisions({ itemUuid: '1-2-3', userUuid: '1-2-3' })

    expect(response.status).toEqual(200)
  })

  it('should indicate failure to get revisions list', async () => {
    getRevisionsMetadata.execute = jest.fn().mockReturnValue(Result.fail('Oops'))
    const response = await createController().getRevisions({ itemUuid: '1-2-3', userUuid: '1-2-3' })

    expect(response.status).toEqual(400)
  })

  it('should get revision', async () => {
    const response = await createController().getRevision({ revisionUuid: '1-2-3', userUuid: '1-2-3' })

    expect(response.status).toEqual(200)
  })

  it('should indicate failure to get revision', async () => {
    getRevision.execute = jest.fn().mockReturnValue(Result.fail('Oops'))
    const response = await createController().getRevision({ revisionUuid: '1-2-3', userUuid: '1-2-3' })

    expect(response.status).toEqual(400)
  })

  it('should delete revision', async () => {
    const response = await createController().deleteRevision({ revisionUuid: '1-2-3', userUuid: '1-2-3' })

    expect(response.status).toEqual(200)
  })

  it('should indicate failure to delete revision', async () => {
    deleteRevision.execute = jest.fn().mockReturnValue(Result.fail('Oops'))
    const response = await createController().deleteRevision({ revisionUuid: '1-2-3', userUuid: '1-2-3' })

    expect(response.status).toEqual(400)
  })
})
