import {
  DomainEventInterface,
  DomainEventPublisherInterface,
  WebSocketMessageRequestedEvent,
} from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SendEventToClient } from './SendEventToClient'
import { Logger } from 'winston'

describe('SendEventToClient', () => {
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let logger: Logger

  const createUseCase = () => new SendEventToClient(domainEventFactory, domainEventPublisher, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createWebSocketMessageRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<WebSocketMessageRequestedEvent>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()
  })

  it('should publish a WebSocketMessageRequestedEvent', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      event: {
        type: 'test',
      } as jest.Mocked<DomainEventInterface>,
    })

    expect(domainEventFactory.createWebSocketMessageRequestedEvent).toHaveBeenCalledWith({
      userUuid: '00000000-0000-0000-0000-000000000000',
      message: JSON.stringify({
        type: 'test',
      }),
    })
    expect(domainEventPublisher.publish).toHaveBeenCalledWith({} as jest.Mocked<WebSocketMessageRequestedEvent>)
  })

  it('should return a failed result if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      event: {
        type: 'test',
      } as jest.Mocked<DomainEventInterface>,
    })

    expect(result.isFailed()).toBe(true)
  })
})
