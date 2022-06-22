import 'reflect-metadata'

import { DomainEventPublisherInterface, FileRemovedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'

import { RemoveFile } from './RemoveFile'
import { FileRemoverInterface } from '../../Services/FileRemoverInterface'

describe('RemoveFile', () => {
  let fileRemover: FileRemoverInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let logger: Logger

  const createUseCase = () => new RemoveFile(fileRemover, domainEventPublisher, domainEventFactory, logger)

  beforeEach(() => {
    fileRemover = {} as jest.Mocked<FileRemoverInterface>
    fileRemover.remove = jest.fn().mockReturnValue(413)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createFileRemovedEvent = jest.fn().mockReturnValue({} as jest.Mocked<FileRemovedEvent>)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
    logger.warn = jest.fn()
  })

  it('should indicate of an error in removing fails', async () => {
    fileRemover.remove = jest.fn().mockImplementation(() => {
      throw new Error('oops')
    })

    expect(
      await createUseCase().execute({
        resourceRemoteIdentifier: '2-3-4',
        userUuid: '1-2-3',
        regularSubscriptionUuid: '3-4-5',
      }),
    ).toEqual({
      success: false,
      message: 'Could not remove resource',
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should remove a file', async () => {
    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      userUuid: '1-2-3',
      regularSubscriptionUuid: '3-4-5',
    })

    expect(fileRemover.remove).toHaveBeenCalledWith('1-2-3/2-3-4')
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})
