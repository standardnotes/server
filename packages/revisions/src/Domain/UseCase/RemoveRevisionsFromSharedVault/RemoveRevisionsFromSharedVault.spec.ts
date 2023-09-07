import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { RevisionRepositoryResolverInterface } from '../../Revision/RevisionRepositoryResolverInterface'
import { RemoveRevisionsFromSharedVault } from './RemoveRevisionsFromSharedVault'

describe('RemoveRevisionsFromSharedVault', () => {
  let revisionRepositoryResolver: RevisionRepositoryResolverInterface
  let revisionRepository: RevisionRepositoryInterface

  const createUseCase = () => new RemoveRevisionsFromSharedVault(revisionRepositoryResolver)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.clearSharedVaultAndKeySystemAssociations = jest.fn()

    revisionRepositoryResolver = {} as jest.Mocked<RevisionRepositoryResolverInterface>
    revisionRepositoryResolver.resolve = jest.fn().mockReturnValue(revisionRepository)
  })

  it('should clear shared vault and key system associations', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      itemUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
      roleNames: ['CORE_USER'],
    })

    expect(revisionRepository.clearSharedVaultAndKeySystemAssociations).toHaveBeenCalled()
  })

  it('should return error when shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      itemUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: 'invalid',
      roleNames: ['CORE_USER'],
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return error when item uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      itemUuid: 'invalid',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
      roleNames: ['CORE_USER'],
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return error when role names are invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      itemUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
      roleNames: ['invalid'],
    })

    expect(result.isFailed()).toBe(true)
  })
})
