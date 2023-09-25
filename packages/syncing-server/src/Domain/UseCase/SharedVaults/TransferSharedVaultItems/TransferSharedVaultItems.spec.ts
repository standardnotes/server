import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { TransferSharedVaultItems } from './TransferSharedVaultItems'

describe('TransferSharedVaultItems', () => {
  let itemRepository: ItemRepositoryInterface

  const createUseCase = () => new TransferSharedVaultItems(itemRepository)

  beforeEach(() => {
    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.updateSharedVaultOwner = jest.fn()
  })

  it('should update shared vault owner', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      fromUserUuid: '0d1d1c7c-5e3e-4b0b-8b4a-8c5b1f8c5b1f',
      toUserUuid: '0d1d1c7c-5e3e-4b0b-8b4a-8c5b1f8c5b1a',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(false)
    expect(itemRepository.updateSharedVaultOwner).toHaveBeenCalled()
  })

  it('should return error when from user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      fromUserUuid: 'invalid',
      toUserUuid: '0d1d1c7c-5e3e-4b0b-8b4a-8c5b1f8c5b1a',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should return error when to user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      fromUserUuid: '0d1d1c7c-5e3e-4b0b-8b4a-8c5b1f8c5b1f',
      toUserUuid: 'invalid',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })

  it('should return error when shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      fromUserUuid: '0d1d1c7c-5e3e-4b0b-8b4a-8c5b1f8c5b1f',
      toUserUuid: '0d1d1c7c-5e3e-4b0b-8b4a-8c5b1f8c5b1a',
      sharedVaultUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })
})
