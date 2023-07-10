import { Timestamps, Uuid } from '@standardnotes/domain-core'
import { Message } from '../../../Message/Message'
import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { DeleteMessage } from './DeleteMessage'

describe('DeleteMessage', () => {
  let messageRepository: MessageRepositoryInterface
  let message: Message

  const createUseCase = () => new DeleteMessage(messageRepository)

  beforeEach(() => {
    message = Message.create({
      senderUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      recipientUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      encryptedMessage: 'encryptedMessage',
      replaceabilityIdentifier: 'replaceabilityIdentifier',
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    messageRepository = {} as jest.Mocked<MessageRepositoryInterface>
    messageRepository.remove = jest.fn()
    messageRepository.findByUuid = jest.fn().mockReturnValue(message)
  })

  it('should remove message', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      messageUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should return error when message is not found', async () => {
    messageRepository.findByUuid = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()
    const result = await useCase.execute({
      messageUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if originator is neither the sender nor the recipient', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      messageUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: '11111111-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error when message uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      messageUuid: 'invalid',
      originatorUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error when originator uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      messageUuid: '00000000-0000-0000-0000-000000000000',
      originatorUuid: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
