import 'reflect-metadata'

import { Logger } from 'winston'

import { MoveFile } from './MoveFile'
import { FileMoverInterface } from '../../Services/FileMoverInterface'

describe('MoveFile', () => {
  let fileRemover: FileMoverInterface

  let logger: Logger

  const createUseCase = () => new MoveFile(fileRemover, logger)

  beforeEach(() => {
    fileRemover = {} as jest.Mocked<FileMoverInterface>
    fileRemover.moveFile = jest.fn().mockReturnValue(413)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
    logger.warn = jest.fn()
  })

  it('should remove a file', async () => {
    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      fromUserUuid: '1-2-3',
      toVaultUuid: '4-5-6',
      regularSubscriptionUuid: '3-4-5',
    })

    expect(fileRemover.moveFile).toHaveBeenCalledWith('1-2-3/2-3-4', '4-5-6/2-3-4')
  })
})
