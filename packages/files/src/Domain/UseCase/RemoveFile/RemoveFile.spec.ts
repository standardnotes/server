import 'reflect-metadata'

import {
  DomainEventPublisherInterface,
  FileRemovedEvent,
  SharedVaultFileRemovedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'

import { RemoveFile } from './RemoveFile'
import { FileRemoverInterface } from '../../Services/FileRemoverInterface'
import { ValetTokenRepositoryInterface } from '../../ValetToken/ValetTokenRepositoryInterface'

describe('RemoveFile', () => {
  let fileRemover: FileRemoverInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let valetTokenRepository: ValetTokenRepositoryInterface
  let logger: Logger

  const createUseCase = () =>
    new RemoveFile(fileRemover, domainEventPublisher, domainEventFactory, valetTokenRepository, logger)

  beforeEach(() => {
    valetTokenRepository = {} as jest.Mocked<ValetTokenRepositoryInterface>
    valetTokenRepository.markAsUsed = jest.fn()

    fileRemover = {} as jest.Mocked<FileRemoverInterface>
    fileRemover.remove = jest.fn().mockReturnValue(413)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createFileRemovedEvent = jest.fn().mockReturnValue({} as jest.Mocked<FileRemovedEvent>)
    domainEventFactory.createSharedVaultFileRemovedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<SharedVaultFileRemovedEvent>)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
    logger.warn = jest.fn()
  })

  it('should indicate of an error in removing fails', async () => {
    fileRemover.remove = jest.fn().mockImplementation(() => {
      throw new Error('oops')
    })

    const result = await createUseCase().execute({
      userInput: {
        resourceRemoteIdentifier: '2-3-4',
        userUuid: '1-2-3',
        regularSubscriptionUuid: '3-4-5',
      },
      valetToken: 'valet-token',
    })
    expect(result.isFailed()).toEqual(true)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should indicate of an error of no proper input', async () => {
    const result = await createUseCase().execute({ valetToken: 'valet-token' })
    expect(result.isFailed()).toEqual(true)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should remove a file for user', async () => {
    await createUseCase().execute({
      userInput: {
        resourceRemoteIdentifier: '2-3-4',
        userUuid: '1-2-3',
        regularSubscriptionUuid: '3-4-5',
      },
      valetToken: 'valet-token',
    })

    expect(fileRemover.remove).toHaveBeenCalledWith('1-2-3/2-3-4')
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should remove a file for shared vault', async () => {
    await createUseCase().execute({
      vaultInput: {
        resourceRemoteIdentifier: '2-3-4',
        sharedVaultUuid: '1-2-3',
        vaultOwnerUuid: '3-4-5',
      },
      valetToken: 'valet-token',
    })

    expect(fileRemover.remove).toHaveBeenCalledWith('1-2-3/2-3-4')
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})
