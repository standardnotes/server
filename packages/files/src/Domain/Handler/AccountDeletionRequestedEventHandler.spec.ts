import 'reflect-metadata'

import {
  AccountDeletionRequestedEvent,
  AccountDeletionRequestedEventPayload,
  DomainEventPublisherInterface,
  FileRemovedEvent,
} from '@standardnotes/domain-events'
import { MarkFilesToBeRemoved } from '../UseCase/MarkFilesToBeRemoved/MarkFilesToBeRemoved'

import { AccountDeletionRequestedEventHandler } from './AccountDeletionRequestedEventHandler'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { RemovedFileDescription } from '../File/RemovedFileDescription'

describe('AccountDeletionRequestedEventHandler', () => {
  let markFilesToBeRemoved: MarkFilesToBeRemoved
  let event: AccountDeletionRequestedEvent
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface

  const createHandler = () =>
    new AccountDeletionRequestedEventHandler(markFilesToBeRemoved, domainEventPublisher, domainEventFactory)

  beforeEach(() => {
    markFilesToBeRemoved = {} as jest.Mocked<MarkFilesToBeRemoved>
    markFilesToBeRemoved.execute = jest.fn().mockReturnValue({
      success: true,
      filesRemoved: [{} as jest.Mocked<RemovedFileDescription>],
    })

    event = {} as jest.Mocked<AccountDeletionRequestedEvent>
    event.payload = {
      userUuid: '1-2-3',
      regularSubscriptionUuid: '1-2-3',
    } as jest.Mocked<AccountDeletionRequestedEventPayload>

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createFileRemovedEvent = jest.fn().mockReturnValue({} as jest.Mocked<FileRemovedEvent>)
  })

  it('should mark files to be remove for user', async () => {
    await createHandler().handle(event)

    expect(markFilesToBeRemoved.execute).toHaveBeenCalledWith({ userUuid: '1-2-3' })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not mark files to be remove for user if user has no regular subscription', async () => {
    event.payload.regularSubscriptionUuid = undefined

    await createHandler().handle(event)

    expect(markFilesToBeRemoved.execute).not.toHaveBeenCalled()

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not publish events if failed to mark files to be removed', async () => {
    markFilesToBeRemoved.execute = jest.fn().mockReturnValue({
      success: false,
    })

    await createHandler().handle(event)

    expect(markFilesToBeRemoved.execute).toHaveBeenCalledWith({ userUuid: '1-2-3' })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })
})
