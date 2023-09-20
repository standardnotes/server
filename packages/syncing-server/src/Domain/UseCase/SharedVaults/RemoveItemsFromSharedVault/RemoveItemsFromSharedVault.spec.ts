import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { RemoveItemsFromSharedVault } from './RemoveItemsFromSharedVault'

describe('RemoveItemsFromSharedVault', () => {
  let itemRepository: ItemRepositoryInterface

  const createUseCase = () => new RemoveItemsFromSharedVault(itemRepository)

  beforeEach(() => {
    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.unassignFromSharedVault = jest.fn()
  })

  it('should unassign items from shared vault', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(itemRepository.unassignFromSharedVault).toHaveBeenCalled()
  })

  it('should return error when shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: 'invalid-uuid',
    })

    expect(result.isFailed()).toBe(true)
  })
})
