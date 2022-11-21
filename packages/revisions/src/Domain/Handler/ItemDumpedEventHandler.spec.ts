import { ItemDumpedEvent } from '@standardnotes/domain-events'
import { DumpRepositoryInterface } from '../Dump/DumpRepositoryInterface'
import { Revision } from '../Revision/Revision'
import { RevisionRepositoryInterface } from '../Revision/RevisionRepositoryInterface'
import { ItemDumpedEventHandler } from './ItemDumpedEventHandler'

describe('ItemDumpedEventHandler', () => {
  let dumpRepository: DumpRepositoryInterface
  let revisionRepository: RevisionRepositoryInterface
  let revision: Revision
  let event: ItemDumpedEvent

  const createHandler = () => new ItemDumpedEventHandler(dumpRepository, revisionRepository)

  beforeEach(() => {
    revision = {} as jest.Mocked<Revision>

    dumpRepository = {} as jest.Mocked<DumpRepositoryInterface>
    dumpRepository.getRevisionFromDumpPath = jest.fn().mockReturnValue(revision)
    dumpRepository.removeDump = jest.fn()

    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.save = jest.fn()

    event = {} as jest.Mocked<ItemDumpedEvent>
    event.payload = {
      fileDumpPath: 'foobar',
    }
  })

  it('should save a revision from file dump', async () => {
    await createHandler().handle(event)

    expect(revisionRepository.save).toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })

  it('should not save a revision if it could not be created from dump', async () => {
    dumpRepository.getRevisionFromDumpPath = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(revisionRepository.save).not.toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })
})
