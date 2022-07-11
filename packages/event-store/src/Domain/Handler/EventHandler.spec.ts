import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'
import { Repository } from 'typeorm'
import { EventHandler } from './EventHandler'
import { Event } from '../Event/Event'
import { Logger } from 'winston'
import { DomainEventInterface } from '@standardnotes/domain-events'

describe('EventHandler', () => {
  let timer: TimerInterface
  let repository: Repository<Event>
  let logger: Logger

  const createHandler = () => new EventHandler(timer, repository, logger)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.convertStringDateToMicroseconds = jest.fn().mockReturnValue(1)

    repository = {} as jest.Mocked<Repository<Event>>
    repository.save = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
  })

  it('should persist as event in the store', async () => {
    const event = {
      type: 'test',
      createdAt: new Date(2),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
      },
      payload: {
        foo: 'bar',
      },
    } as jest.Mocked<DomainEventInterface>
    await createHandler().handle(event)

    expect(repository.save).toHaveBeenCalledWith({
      eventType: 'test',
      timestamp: 1,
      userIdentifier: '1-2-3',
      userIdentifierType: 'uuid',
      eventPayload: '{"foo":"bar"}',
    })
  })

  it('should inform about failure to saven the event in the store', async () => {
    const event = {
      type: 'test',
      createdAt: new Date(2),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
      },
      payload: {
        foo: 'bar',
      },
    } as jest.Mocked<DomainEventInterface>
    repository.save = jest.fn().mockImplementation(() => {
      throw new Error('Ooops')
    })

    await createHandler().handle(event)

    expect(logger.error).toHaveBeenCalledWith('Could not store event %O in the event store: %s', event, 'Ooops')
  })
})
