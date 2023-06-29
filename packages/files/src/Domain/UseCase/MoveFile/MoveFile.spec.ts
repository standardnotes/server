import 'reflect-metadata'

import { Logger } from 'winston'

import { MoveFile } from './MoveFile'
import { FileMoverInterface } from '../../Services/FileMoverInterface'

describe('MoveFile', () => {
  let fileMover: FileMoverInterface

  let logger: Logger

  const createUseCase = () => new MoveFile(fileMover, logger)

  beforeEach(() => {
    fileMover = {} as jest.Mocked<FileMoverInterface>
    fileMover.moveFile = jest.fn().mockReturnValue(413)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
    logger.warn = jest.fn()
  })

  it('should move a file', async () => {
    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      fromUuid: '1-2-3',
      toUuid: '4-5-6',
      moveType: 'shared-vault-to-user',
    })

    expect(fileMover.moveFile).toHaveBeenCalledWith('1-2-3/2-3-4', '4-5-6/2-3-4')
  })

  it('should indicate an error if moving fails', async () => {
    fileMover.moveFile = jest.fn().mockImplementation(() => {
      throw new Error('oops')
    })

    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      fromUuid: '1-2-3',
      toUuid: '4-5-6',
      moveType: 'shared-vault-to-user',
    })

    expect(result.isFailed()).toEqual(true)
  })
})
