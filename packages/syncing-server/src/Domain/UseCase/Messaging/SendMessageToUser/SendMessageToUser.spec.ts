import { TimerInterface } from '@standardnotes/time'
import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { SendMessageToUser } from './SendMessageToUser'
import { Message } from '../../../Message/Message'
import { Result, Timestamps, Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SendEventToClient } from '../../Syncing/SendEventToClient/SendEventToClient'
import { MessageSentToUserEvent } from '@standardnotes/domain-events'

describe('SendMessageToUser', () => {
  const recipientUuid = '00000000-0000-0000-0000-000000000001'
  const senderUuid = '00000000-0000-0000-0000-000000000002'
  const otherSenderUuid = '00000000-0000-0000-0000-000000000003'

  let messageRepository: MessageRepositoryInterface
  let timer: TimerInterface
  let existingMessage: Message
  let domainEventFactory: DomainEventFactoryInterface
  let sendEventToClientUseCase: SendEventToClient
  let logger: Logger

  const createMessage = (messageSenderUuid: string) =>
    Message.create({
      recipientUuid: Uuid.create(recipientUuid).getValue(),
      senderUuid: Uuid.create(messageSenderUuid).getValue(),
      encryptedMessage: 'existing-encrypted-message',
      replaceabilityIdentifier: 'replaceability-identifier',
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
    }).getValue()

  const createUseCase = () =>
    new SendMessageToUser(messageRepository, timer, domainEventFactory, sendEventToClientUseCase, logger)

  beforeEach(() => {
    existingMessage = createMessage(senderUuid)

    messageRepository = {} as jest.Mocked<MessageRepositoryInterface>
    messageRepository.findByRecipientUuidSenderUuidAndReplaceabilityIdentifier = jest.fn().mockReturnValue(null)
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
      recipientUuid,
      senderUuid,
      encryptedMessage: 'encrypted-message',
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('removes existing message with the same replaceability identifier from the same sender', async () => {
    messageRepository.findByRecipientUuidSenderUuidAndReplaceabilityIdentifier = jest
      .fn()
      .mockReturnValue(existingMessage)
    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid,
      senderUuid,
      encryptedMessage: 'encrypted-message',
      replaceabilityIdentifier: 'replaceability-identifier',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(messageRepository.findByRecipientUuidSenderUuidAndReplaceabilityIdentifier).toHaveBeenCalledWith({
      recipientUuid: Uuid.create(recipientUuid).getValue(),
      senderUuid: Uuid.create(senderUuid).getValue(),
      replaceabilityIdentifier: 'replaceability-identifier',
    })
    expect(messageRepository.remove).toHaveBeenCalledWith(existingMessage)
  })

  it('does not remove another sender message when reusing the same replaceability identifier', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid,
      senderUuid: otherSenderUuid,
      encryptedMessage: 'encrypted-message',
      replaceabilityIdentifier: 'replaceability-identifier',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(messageRepository.findByRecipientUuidSenderUuidAndReplaceabilityIdentifier).toHaveBeenCalledWith({
      recipientUuid: Uuid.create(recipientUuid).getValue(),
      senderUuid: Uuid.create(otherSenderUuid).getValue(),
      replaceabilityIdentifier: 'replaceability-identifier',
    })
    expect(messageRepository.remove).not.toHaveBeenCalled()
    expect(messageRepository.save).toHaveBeenCalled()
  })

  it('returns error when recipient uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid: 'invalid-uuid',
      senderUuid,
      encryptedMessage: 'encrypted-message',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns error when sender uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid,
      senderUuid: 'invalid-uuid',
      encryptedMessage: 'encrypted-message',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns error when message is empty', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid,
      senderUuid,
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
      recipientUuid,
      senderUuid,
      encryptedMessage: 'encrypted-message',
    })

    expect(result.isFailed()).toBeTruthy()

    mock.mockRestore()
  })

  it('should log error if event could not be sent to user', async () => {
    sendEventToClientUseCase.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      recipientUuid,
      senderUuid,
      encryptedMessage: 'encrypted-message',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toHaveBeenCalled()
  })
})
