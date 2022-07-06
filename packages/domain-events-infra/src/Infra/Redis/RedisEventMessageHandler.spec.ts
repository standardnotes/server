import 'reflect-metadata'

import { Logger } from 'winston'

import { DomainEventHandlerInterface } from '@standardnotes/domain-events'

import { RedisEventMessageHandler } from './RedisEventMessageHandler'

describe('RedisEventMessageHandler', () => {
  let handler: DomainEventHandlerInterface
  let handlers: Map<string, DomainEventHandlerInterface>
  let logger: Logger

  const createHandler = () => new RedisEventMessageHandler(handlers, logger)

  beforeEach(() => {
    handler = {} as jest.Mocked<DomainEventHandlerInterface>
    handler.handle = jest.fn()

    handlers = new Map([['TEST', handler]])

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
  })

  it('should handle messages', async () => {
    await createHandler().handleMessage('eJyrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV1gIA9tQMhA==')

    expect(handler.handle).toHaveBeenCalledWith({
      payload: {
        foo: 'bar',
      },
      type: 'TEST',
    })
  })

  it('should handle errors', async () => {
    await createHandler().handleMessage('eJyasdasdrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV1gIA9tQMhA==')

    expect(logger.error).toHaveBeenCalled()
    expect(handler.handle).not.toHaveBeenCalled()
  })

  it('should tell if there is no handler for an event', async () => {
    await createHandler().handleMessage('eJyrViqpLEhVslIKcQ0OMVLSUSpIrMzJT0xRsqpWSsvPB0okJRYp1dYCAABHDLY=')

    expect(logger.debug).toHaveBeenCalledWith('Event handler for event type TEST2 does not exist')

    expect(handler.handle).not.toHaveBeenCalled()
  })
})
