import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { DeleteRevisions } from './DeleteRevisions'

describe('DeleteRevisions', () => {
  let revisionRepository: RevisionRepositoryInterface

  const createUseCase = () => new DeleteRevisions(revisionRepository)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.removeByItemUuid = jest.fn()
  })

  it('should remove revisions by item uuid', async () => {
    const useCase = createUseCase()
    const itemUuid = '00000000-0000-0000-0000-000000000000'

    const result = await useCase.execute({ itemUuid })

    expect(result.isFailed()).toBe(false)
    expect(revisionRepository.removeByItemUuid).toHaveBeenCalled()
  })

  it('should return failed result if item uuid is invalid', async () => {
    const useCase = createUseCase()
    const itemUuid = 'invalid'

    const result = await useCase.execute({ itemUuid })

    expect(result.isFailed()).toBe(true)
  })
})
