import { Result, Timestamps, Uuid } from '@standardnotes/domain-core'
import { Message } from '../../../Message/Message'
import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { DeleteMessage } from '../DeleteMessage/DeleteMessage'
import { DeleteAllMessagesSentToUser } from './DeleteAllMessagesSentToUser'

describe('DeleteAllMessagesSentToUser', () => {
  let messageRepository: MessageRepositoryInterface
  let deleteMessageUseCase: DeleteMessage
  let message: Message

  const createUseCase = () => new DeleteAllMessagesSentToUser(messageRepository, deleteMessageUseCase)

  beforeEach(() => {
    message = Message.create({
      senderUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      recipientUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      encryptedMessage: 'encryptedMessage',
      replaceabilityIdentifier: 'replaceabilityIdentifier',
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    messageRepository = {} as jest.Mocked<MessageRepositoryInterface>
    messageRepository.findByRecipientUuid = jest.fn().mockReturnValue([message])

    deleteMessageUseCase = {} as jest.Mocked<DeleteMessage>
    deleteMessageUseCase.execute = jest.fn().mockReturnValue(Result.ok())
  })

  it('should delete all messages sent to user', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      recipientUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should return error when recipient uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      recipientUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should return error when delete message use case fails', async () => {
    const useCase = createUseCase()
    deleteMessageUseCase.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await useCase.execute({
      recipientUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('error')
  })
})
