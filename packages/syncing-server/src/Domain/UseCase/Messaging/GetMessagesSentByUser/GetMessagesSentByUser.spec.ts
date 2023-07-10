import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { GetMessagesSentByUser } from './GetMessagesSentByUser'

describe('GetMessagesSentByUser', () => {
  let messageRepository: MessageRepositoryInterface

  const createUseCase = () => new GetMessagesSentByUser(messageRepository)

  beforeEach(() => {
    messageRepository = {} as jest.Mocked<MessageRepositoryInterface>
    messageRepository.findBySenderUuid = jest.fn().mockReturnValue([])
  })

  it('should return messages sent by user', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      senderUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.getValue()).toEqual([])
  })

  it('should return error when sender uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      senderUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })
})
