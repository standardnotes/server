import 'reflect-metadata'

import { DomainEventHandlerInterface } from '@standardnotes/domain-events'

import { startBackgroundTransaction } from 'newrelic'
jest.mock('newrelic')

import { Logger } from 'winston'

import { SQSNewRelicBounceNotificiationHandler } from './SQSNewRelicBounceNotificiationHandler'

describe('SQSNewRelicBounceNotificiationHandler', () => {
  let handler: DomainEventHandlerInterface
  let handlers: Map<string, DomainEventHandlerInterface>
  let logger: Logger
  let mockedStartBackgroundTransaction: unknown

  const createHandler = () => new SQSNewRelicBounceNotificiationHandler(handlers, logger)

  beforeEach(() => {
    handler = {} as jest.Mocked<DomainEventHandlerInterface>
    handler.handle = jest.fn()

    handlers = new Map([['EMAIL_BOUNCED', handler]])

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()

    mockedStartBackgroundTransaction = startBackgroundTransaction as jest.Mocked<unknown>
  })

  it('should handle messages', async () => {
    const sqsMessage = `{
      "Message" : "{\\"notificationType\\":\\"Bounce\\",\\"bounce\\":{\\"feedbackId\\":\\"010001879d0a9def-d9882210-6467-48ed-8088-2193c66a349b-000000\\",\\"bounceType\\":\\"Transient\\",\\"bounceSubType\\":\\"General\\",\\"bouncedRecipients\\":[{\\"emailAddress\\":\\"test@test.te\\",\\"action\\":\\"failed\\",\\"status\\":\\"5.7.1\\",\\"diagnosticCode\\":\\"smtp; 550 5.7.1 <test@test.te>: Recipient address rejected: Recipient not found\\"}],\\"timestamp\\":\\"2023-04-20T05:02:11.000Z\\",\\"remoteMtaIp\\":\\"1.2.3.4\\",\\"reportingMTA\\":\\"dns; test.smtp-out.amazonses.com\\"},\\"mail\\":{\\"timestamp\\":\\"2023-04-20T05:02:08.589Z\\",\\"source\\":\\"Standard Notes <backups@standardnotes.org>\\",\\"sourceArn\\":\\"arn:aws:ses:us-east-1:336603415364:identity/backups@standardnotes.org\\",\\"sourceIp\\":\\"1.2.3.4\\",\\"callerIdentity\\":\\"test\\",\\"sendingAccountId\\":\\"123456\\",\\"messageId\\":\\"010001879d0a92cd-00ed31d1-bf9e-4ce4-abb9-8c6e95a30733-000000\\",\\"destination\\":[\\"test@test.te\\"]}}"
    }`

    await createHandler().handleMessage(sqsMessage)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((<any>mockedStartBackgroundTransaction).mock.calls[0][0]).toBe('EMAIL_BOUNCED')
  })

  it('should not handle unsupported messages', async () => {
    const sqsMessage = `{
      "Message" : "{\\"notificationType\\":\\"TEST\\",\\"bounce\\":{\\"feedbackId\\":\\"010001879d0a9def-d9882210-6467-48ed-8088-2193c66a349b-000000\\",\\"bounceType\\":\\"Transient\\",\\"bounceSubType\\":\\"General\\",\\"bouncedRecipients\\":[{\\"emailAddress\\":\\"test@test.te\\",\\"action\\":\\"failed\\",\\"status\\":\\"5.7.1\\",\\"diagnosticCode\\":\\"smtp; 550 5.7.1 <test@test.te>: Recipient address rejected: Recipient not found\\"}],\\"timestamp\\":\\"2023-04-20T05:02:11.000Z\\",\\"remoteMtaIp\\":\\"1.2.3.4\\",\\"reportingMTA\\":\\"dns; test.smtp-out.amazonses.com\\"},\\"mail\\":{\\"timestamp\\":\\"2023-04-20T05:02:08.589Z\\",\\"source\\":\\"Standard Notes <backups@standardnotes.org>\\",\\"sourceArn\\":\\"arn:aws:ses:us-east-1:336603415364:identity/backups@standardnotes.org\\",\\"sourceIp\\":\\"1.2.3.4\\",\\"callerIdentity\\":\\"test\\",\\"sendingAccountId\\":\\"123456\\",\\"messageId\\":\\"010001879d0a92cd-00ed31d1-bf9e-4ce4-abb9-8c6e95a30733-000000\\",\\"destination\\":[\\"test@test.te\\"]}}"
    }`

    await createHandler().handleMessage(sqsMessage)

    expect(handler.handle).not.toHaveBeenCalled()
  })

  it('should handle errors', async () => {
    await createHandler().handleError(new Error('test'))

    expect(logger.error).toHaveBeenCalled()
  })

  it('should tell if there is no handler for an event', async () => {
    const sqsMessage = `{
      "Message" : "{\\"notificationType\\":\\"Bounce\\",\\"bounce\\":{\\"feedbackId\\":\\"010001879d0a9def-d9882210-6467-48ed-8088-2193c66a349b-000000\\",\\"bounceType\\":\\"Transient\\",\\"bounceSubType\\":\\"General\\",\\"bouncedRecipients\\":[{\\"emailAddress\\":\\"test@test.te\\",\\"action\\":\\"failed\\",\\"status\\":\\"5.7.1\\",\\"diagnosticCode\\":\\"smtp; 550 5.7.1 <test@test.te>: Recipient address rejected: Recipient not found\\"}],\\"timestamp\\":\\"2023-04-20T05:02:11.000Z\\",\\"remoteMtaIp\\":\\"1.2.3.4\\",\\"reportingMTA\\":\\"dns; test.smtp-out.amazonses.com\\"},\\"mail\\":{\\"timestamp\\":\\"2023-04-20T05:02:08.589Z\\",\\"source\\":\\"Standard Notes <backups@standardnotes.org>\\",\\"sourceArn\\":\\"arn:aws:ses:us-east-1:336603415364:identity/backups@standardnotes.org\\",\\"sourceIp\\":\\"1.2.3.4\\",\\"callerIdentity\\":\\"test\\",\\"sendingAccountId\\":\\"123456\\",\\"messageId\\":\\"010001879d0a92cd-00ed31d1-bf9e-4ce4-abb9-8c6e95a30733-000000\\",\\"destination\\":[\\"test@test.te\\"]}}"
    }`

    const bounceHandler = new SQSNewRelicBounceNotificiationHandler(new Map([]), logger)
    await bounceHandler.handleMessage(sqsMessage)

    expect(logger.debug).toHaveBeenCalledWith('Event handler for event type EMAIL_BOUNCED does not exist')

    expect(handler.handle).not.toHaveBeenCalled()
  })
})
