import { RevisionMetadata } from '../../Revision/RevisionMetadata'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { GetRevisionsMetada } from './GetRevisionsMetada'

describe('GetRevisionsMetada', () => {
  let revisionRepository: RevisionRepositoryInterface

  const createUseCase = () => new GetRevisionsMetada(revisionRepository)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.findMetadataByItemId = jest.fn().mockReturnValue([{} as jest.Mocked<RevisionMetadata>])
  })

  it('should return revisions metadata for a given item', async () => {
    const result = await createUseCase().execute({
      itemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      sharedVaultUuids: ['84c0f8e8-544a-4c7e-9adf-26209303bc1d'],
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().length).toEqual(1)
  })

  it('should not return revisions metadata for an invalid shared vault uuid', async () => {
    const result = await createUseCase().execute({
      itemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      sharedVaultUuids: ['1-2-3'],
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should not return revisions metadata for a an invalid item uuid', async () => {
    const result = await createUseCase().execute({
      itemUuid: '1-2-3',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      sharedVaultUuids: [],
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should not return revisions metadata for a an invalid user uuid', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      sharedVaultUuids: [],
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
