import { RevisionMetadata } from '../../Revision/RevisionMetadata'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { RevisionRepositoryResolverInterface } from '../../Revision/RevisionRepositoryResolverInterface'
import { GetRevisionsMetada } from './GetRevisionsMetada'

describe('GetRevisionsMetada', () => {
  let revisionRepository: RevisionRepositoryInterface
  let revisionRepositoryResolver: RevisionRepositoryResolverInterface

  const createUseCase = () => new GetRevisionsMetada(revisionRepositoryResolver)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.findMetadataByItemId = jest.fn().mockReturnValue([{} as jest.Mocked<RevisionMetadata>])

    revisionRepositoryResolver = {} as jest.Mocked<RevisionRepositoryResolverInterface>
    revisionRepositoryResolver.resolve = jest.fn().mockReturnValue(revisionRepository)
  })

  it('should return revisions metadata for a given item', async () => {
    const result = await createUseCase().execute({
      itemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['CORE_USER'],
      sharedVaultUuids: ['84c0f8e8-544a-4c7e-9adf-26209303bc1d'],
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().length).toEqual(1)
  })

  it('should not return revisions metadata for an invalid shared vault uuid', async () => {
    const result = await createUseCase().execute({
      itemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['CORE_USER'],
      sharedVaultUuids: ['1-2-3'],
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should not return revisions metadata for a an invalid item uuid', async () => {
    const result = await createUseCase().execute({
      itemUuid: '1-2-3',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['CORE_USER'],
      sharedVaultUuids: [],
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should not return revisions metadata for a an invalid user uuid', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['CORE_USER'],
      sharedVaultUuids: [],
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should do nothing if role names are not valid', async () => {
    const result = await createUseCase().execute({
      itemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      roleNames: ['INVALID_ROLE_NAME'],
      sharedVaultUuids: [],
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
