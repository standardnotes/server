import { Revision } from '../../Revision/Revision'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { RevisionRepositoryResolverInterface } from '../../Revision/RevisionRepositoryResolverInterface'
import { GetRevision } from './GetRevision'

describe('GetRevision', () => {
  let revisionRepository: RevisionRepositoryInterface
  let revisionRepositoryResolver: RevisionRepositoryResolverInterface

  const createUseCase = () => new GetRevision(revisionRepositoryResolver)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.findOneByUuid = jest.fn().mockReturnValue({} as jest.Mocked<Revision>)

    revisionRepositoryResolver = {} as jest.Mocked<RevisionRepositoryResolverInterface>
    revisionRepositoryResolver.resolve = jest.fn().mockReturnValue(revisionRepository)
  })

  it('should return revision for a given item', async () => {
    const result = await createUseCase().execute({
      revisionUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['CORE_USER'],
      sharedVaultUuids: ['84c0f8e8-544a-4c7e-9adf-26209303bc1d'],
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()).not.toBeNull()
  })

  it('should do nothing if shared vault uuid is invalid', async () => {
    const result = await createUseCase().execute({
      revisionUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['CORE_USER'],
      sharedVaultUuids: ['INVALID_SHARED_VAULT_UUID'],
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should do nothing if role names are not valid', async () => {
    const result = await createUseCase().execute({
      revisionUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['INVALID_ROLE_NAME'],
      sharedVaultUuids: ['84c0f8e8-544a-4c7e-9adf-26209303bc1d'],
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should not return revision for a given item if not found', async () => {
    revisionRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      revisionUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['CORE_USER'],
      sharedVaultUuids: ['84c0f8e8-544a-4c7e-9adf-26209303bc1d'],
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should not return revision for a an invalid item uuid', async () => {
    const result = await createUseCase().execute({
      revisionUuid: '1-2-3',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['CORE_USER'],
      sharedVaultUuids: ['84c0f8e8-544a-4c7e-9adf-26209303bc1d'],
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should not return revision for a an invalid user uuid', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      revisionUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['CORE_USER'],
      sharedVaultUuids: ['84c0f8e8-544a-4c7e-9adf-26209303bc1d'],
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
