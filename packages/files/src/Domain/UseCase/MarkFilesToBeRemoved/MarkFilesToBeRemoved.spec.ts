import 'reflect-metadata'
import { Logger } from 'winston'
import { FileRemoverInterface } from '../../Services/FileRemoverInterface'

import { MarkFilesToBeRemoved } from './MarkFilesToBeRemoved'

describe('MarkFilesToBeRemoved', () => {
  let fileRemover: FileRemoverInterface
  let logger: Logger

  const createUseCase = () => new MarkFilesToBeRemoved(fileRemover, logger)

  beforeEach(() => {
    fileRemover = {} as jest.Mocked<FileRemoverInterface>
    fileRemover.markFilesToBeRemoved = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
    logger.warn = jest.fn()
  })

  it('should mark files for being removed', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3' })).toEqual({ success: true })

    expect(fileRemover.markFilesToBeRemoved).toHaveBeenCalledWith('1-2-3')
  })

  it('should indicate if marking files for being removed goes wrong', async () => {
    fileRemover.markFilesToBeRemoved = jest.fn().mockImplementation(() => {
      throw new Error('Oops')
    })

    expect(await createUseCase().execute({ userUuid: '1-2-3' })).toEqual({
      success: false,
      message: 'Could not mark resources for removal',
    })
  })
})
