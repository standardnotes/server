import 'reflect-metadata'

import {
  SharedSubscriptionInvitationCanceledEvent,
  SharedSubscriptionInvitationCanceledEventPayload,
  DomainEventPublisherInterface,
  FileRemovedEvent,
} from '@standardnotes/domain-events'
import { MarkFilesToBeRemoved } from '../UseCase/MarkFilesToBeRemoved/MarkFilesToBeRemoved'

import { SharedSubscriptionInvitationCanceledEventHandler } from './SharedSubscriptionInvitationCanceledEventHandler'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { RemovedFileDescription } from '../File/RemovedFileDescription'

describe('SharedSubscriptionInvitationCanceledEventHandler', () => {
  let markFilesToBeRemoved: MarkFilesToBeRemoved
  let event: SharedSubscriptionInvitationCanceledEvent
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface

  const createHandler = () =>
    new SharedSubscriptionInvitationCanceledEventHandler(markFilesToBeRemoved, domainEventPublisher, domainEventFactory)

  beforeEach(() => {
    markFilesToBeRemoved = {} as jest.Mocked<MarkFilesToBeRemoved>
    markFilesToBeRemoved.execute = jest.fn().mockReturnValue({
      success: true,
      filesRemoved: [{} as jest.Mocked<RemovedFileDescription>],
    })

    event = {} as jest.Mocked<SharedSubscriptionInvitationCanceledEvent>
    event.payload = {
      inviteeIdentifier: '1-2-3',
      inviteeIdentifierType: 'uuid',
    } as jest.Mocked<SharedSubscriptionInvitationCanceledEventPayload>

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createFileRemovedEvent = jest.fn().mockReturnValue({} as jest.Mocked<FileRemovedEvent>)
  })

  it('should mark files to be remove for user', async () => {
    await createHandler().handle(event)

    expect(markFilesToBeRemoved.execute).toHaveBeenCalledWith({ ownerUuid: '1-2-3' })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not mark files to be remove for user if identifier is not of uuid type', async () => {
    event.payload.inviteeIdentifierType = 'email'

    await createHandler().handle(event)

    expect(markFilesToBeRemoved.execute).not.toHaveBeenCalled()

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not publish events if failed to mark files to be removed', async () => {
    markFilesToBeRemoved.execute = jest.fn().mockReturnValue({
      success: false,
    })

    await createHandler().handle(event)

    expect(markFilesToBeRemoved.execute).toHaveBeenCalledWith({ ownerUuid: '1-2-3' })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })
})
