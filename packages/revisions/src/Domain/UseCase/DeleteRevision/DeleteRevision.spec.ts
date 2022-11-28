import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { DeleteRevision } from './DeleteRevision'

describe('DeleteRevision', () => {
  let revisionRepository: RevisionRepositoryInterface

  const createUseCase = () => new DeleteRevision(revisionRepository)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.removeOneByUuid = jest.fn()
  })

  it('should delete revision', async () => {
    const result = await createUseCase().execute({
      revisionUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()).toEqual('Revision removed')
  })

  it('should not delete revision for an invalid item uuid', async () => {
    const result = await createUseCase().execute({
      revisionUuid: '1-2-3',
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should not delete revision for a an invalid user uuid', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      revisionUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
