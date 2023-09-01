import { TimerInterface } from '@standardnotes/time'
import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { SendMessageToUser } from './SendMessageToUser'
import { Message } from '../../../Message/Message'
import { Result } from '@standardnotes/domain-core'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SendEventToClient } from '../../Syncing/SendEventToClient/SendEventToClient'
import { MessageSentToUserEvent } from '@standardnotes/domain-events'

describe('SendMessageToUser', () => {
  let messageRepository: MessageRepositoryInterface
  let timer: TimerInterface
  let existingMessage: Message
  let domainEventFactory: DomainEventFactoryInterface
  let sendEventToClientUseCase: SendEventToClient
  let logger: Logger

  const createUseCase = () =>
    new SendMessageToUser(messageRepository, timer, domainEventFactory, sendEventToClientUseCase, logger)

  beforeEach(() => {
    existingMessage = {} as jest.Mocked<Message>

    messageRepository = {} as jest.Mocked<MessageRepositoryInterface>
    messageRepository.findByRecipientUuidAndReplaceabilityIdentifier = jest.fn().mockReturnValue(null)
    messageRepository.remove = jest.fn()
    messageRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123456789)

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createMessageSentToUserEvent = jest.fn().mockReturnValue({
      type: 'MESSAGE_SENT_TO_USER',
    } as jest.Mocked<MessageSentToUserEvent>)

    sendEventToClientUseCase = {} as jest.Mocked<SendEventToClient>
    sendEventToClientUseCase.execute = jest.fn().mockReturnValue(Result.ok())

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('saves a new message', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: 'encrypted-message',
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('removes existing message with the same replaceability identifier', async () => {
    messageRepository.findByRecipientUuidAndReplaceabilityIdentifier = jest.fn().mockReturnValue(existingMessage)
    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: 'encrypted-message',
      replaceabilityIdentifier: 'replaceability-identifier',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(messageRepository.remove).toHaveBeenCalledWith(existingMessage)
  })

  it('returns error when recipient uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid: 'invalid-uuid',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: 'encrypted-message',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns error when sender uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: 'invalid-uuid',
      encryptedMessage: 'encrypted-message',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns error when message is empty', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: '',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns error when message fails to create', async () => {
    const mock = jest.spyOn(Message, 'create')
    mock.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: 'encrypted-message',
    })

    expect(result.isFailed()).toBeTruthy()

    mock.mockRestore()
  })

  it('should log error if event could not be sent to user', async () => {
    sendEventToClientUseCase.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      senderUuid: '00000000-0000-0000-0000-000000000000',
      encryptedMessage: 'encrypted-message',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toHaveBeenCalled()
  })
})
