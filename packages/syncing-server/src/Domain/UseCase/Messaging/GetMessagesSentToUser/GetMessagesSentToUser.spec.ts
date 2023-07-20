import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { GetMessagesSentToUser } from './GetMessagesSentToUser'

describe('GetMessagesSentToUser', () => {
  let messageRepository: MessageRepositoryInterface

  const createUseCase = () => new GetMessagesSentToUser(messageRepository)

  beforeEach(() => {
    messageRepository = {} as jest.Mocked<MessageRepositoryInterface>
    messageRepository.findByRecipientUuid = jest.fn().mockReturnValue([])
    messageRepository.findByRecipientUuidUpdatedAfter = jest.fn().mockReturnValue([])
  })

  it('should return messages sent to user', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      recipientUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.getValue()).toEqual([])
  })

  it('should return messages sent to user updated after given time', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      recipientUuid: '00000000-0000-0000-0000-000000000000',
      lastSyncTime: 123,
    })

    expect(result.getValue()).toEqual([])
  })

  it('should return error when recipient uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      recipientUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })
})
