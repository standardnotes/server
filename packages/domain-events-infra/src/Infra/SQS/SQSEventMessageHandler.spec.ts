import 'reflect-metadata'

import { Logger } from 'winston'

import { DomainEventHandlerInterface } from '@standardnotes/domain-events'

import { SQSEventMessageHandler } from './SQSEventMessageHandler'

describe('SQSEventMessageHandler', () => {
  let handler: DomainEventHandlerInterface
  let handlers: Map<string, DomainEventHandlerInterface>
  let logger: Logger

  const createHandler = () => new SQSEventMessageHandler(handlers, logger)

  beforeEach(() => {
    handler = {} as jest.Mocked<DomainEventHandlerInterface>
    handler.handle = jest.fn()

    handlers = new Map([['TEST', handler]])

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
  })

  it('should handle messages', async () => {
    const sqsMessage = `{
      "Message" : "eJyrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV6iglF6UmlqSmOJYAhQwtzQ10DQyBKMTAwAqM9AwMDKOUagGlWhXt"
    }`

    await createHandler().handleMessage(sqsMessage)

    expect(handler.handle).toHaveBeenCalledWith({
      payload: {
        foo: 'bar',
      },
      type: 'TEST',
      createdAt: new Date(1),
    })
  })

  it('should handle errors', async () => {
    await createHandler().handleError(new Error('test'))

    expect(logger.error).toHaveBeenCalled()
  })

  it('should tell if there is no handler for an event', async () => {
    const sqsMessage = `{
      "Message" : "eJyrViqpLEhVslIKcQ0OMVLSUSpIrMzJT0xRsqpWSsvPB0okJRYp1dYCAABHDLY="
    }`

    await createHandler().handleMessage(sqsMessage)

    expect(logger.debug).toHaveBeenCalledWith('Event handler for event type TEST2 does not exist')

    expect(handler.handle).not.toHaveBeenCalled()
  })
})
