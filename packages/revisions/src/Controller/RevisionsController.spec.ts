import { Result } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { GetRevisionsMetada } from '../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'

import { RevisionsController } from './RevisionsController'

describe('RevisionsController', () => {
  let getRevisionsMetadata: GetRevisionsMetada
  let logger: Logger

  const createController = () => new RevisionsController(getRevisionsMetadata, logger)

  beforeEach(() => {
    getRevisionsMetadata = {} as jest.Mocked<GetRevisionsMetada>
    getRevisionsMetadata.execute = jest.fn().mockReturnValue(Result.ok())

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
})
