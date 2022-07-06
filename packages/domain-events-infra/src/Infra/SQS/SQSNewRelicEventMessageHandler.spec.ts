import 'reflect-metadata'

import { DomainEventHandlerInterface } from '@standardnotes/domain-events'

import { startBackgroundTransaction } from 'newrelic'
jest.mock('newrelic')

import { Logger } from 'winston'

import { SQSNewRelicEventMessageHandler } from './SQSNewRelicEventMessageHandler'

describe('SQSNewRelicEventMessageHandler', () => {
  let handler: DomainEventHandlerInterface
  let handlers: Map<string, DomainEventHandlerInterface>
  let logger: Logger
  let mockedStartBackgroundTransaction: unknown

  const createHandler = () => new SQSNewRelicEventMessageHandler(handlers, logger)

  beforeEach(() => {
    handler = {} as jest.Mocked<DomainEventHandlerInterface>
    handler.handle = jest.fn()

    handlers = new Map([['TEST', handler]])

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()

    mockedStartBackgroundTransaction = startBackgroundTransaction as jest.Mocked<unknown>
  })

  it('should handle messages', async () => {
    const sqsMessage = `{
      "Message" : "eJyrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV6iglF6UmlqSmOJYAhQwtzQ10DQyBKMTAwAqM9AwMDKOUagGlWhXt"
    }`

    await createHandler().handleMessage(sqsMessage)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((<any>mockedStartBackgroundTransaction).mock.calls[0][0]).toBe('TEST')
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
