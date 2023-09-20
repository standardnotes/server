import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { RemoveRevisionsFromSharedVault } from './RemoveRevisionsFromSharedVault'

describe('RemoveRevisionsFromSharedVault', () => {
  let revisionRepository: RevisionRepositoryInterface

  const createUseCase = () => new RemoveRevisionsFromSharedVault(revisionRepository)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.clearSharedVaultAndKeySystemAssociations = jest.fn()
  })

  it('should clear shared vault and key system associations', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      itemUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(revisionRepository.clearSharedVaultAndKeySystemAssociations).toHaveBeenCalled()
  })

  it('should clear shared vault and key system associations for all items in a vault when item uuid is not provided', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(revisionRepository.clearSharedVaultAndKeySystemAssociations).toHaveBeenCalled()
  })

  it('should return error when shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      itemUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return error when item uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      itemUuid: 'invalid',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBe(true)
  })
})
