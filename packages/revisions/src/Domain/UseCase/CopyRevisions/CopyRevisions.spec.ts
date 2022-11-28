import { Result } from '@standardnotes/domain-core'
import { Revision } from '../../Revision/Revision'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { CopyRevisions } from './CopyRevisions'

describe('CopyRevisions', () => {
  let revisionRepository: RevisionRepositoryInterface

  const createUseCase = () => new CopyRevisions(revisionRepository)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.findByItemUuid = jest.fn().mockReturnValue([{} as jest.Mocked<Revision>])
    revisionRepository.save = jest.fn()
  })

  it('should not copy revisions to new item if revision creation fails', async () => {
    const revisionMock = jest.spyOn(Revision, 'create')
    revisionMock.mockImplementation(() => Result.fail('Oops'))

    const result = await createUseCase().execute({
      originalItemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      newItemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
    })

    expect(result.isFailed()).toBeTruthy()

    revisionMock.mockRestore()
  })

  it('should copy revisions to new item', async () => {
    const result = await createUseCase().execute({
      originalItemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      newItemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(revisionRepository.save).toHaveBeenCalled()
    expect(result.getValue()).toEqual('Revisions copied')
  })

  it('should not copy revisions for an invalid item uuid', async () => {
    const result = await createUseCase().execute({
      originalItemUuid: '1-2-3',
      newItemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should not delete revision for a an invalid new item uuid', async () => {
    const result = await createUseCase().execute({
      newItemUuid: '1-2-3',
      originalItemUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
