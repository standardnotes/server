import { ItemDumpedEvent } from '@standardnotes/domain-events'
import { DumpRepositoryInterface } from '../Dump/DumpRepositoryInterface'
import { Revision } from '../Revision/Revision'
import { RevisionRepositoryInterface } from '../Revision/RevisionRepositoryInterface'
import { ItemDumpedEventHandler } from './ItemDumpedEventHandler'
import { RevisionRepositoryResolverInterface } from '../Revision/RevisionRepositoryResolverInterface'

describe('ItemDumpedEventHandler', () => {
  let dumpRepository: DumpRepositoryInterface
  let revisionRepository: RevisionRepositoryInterface
  let revisionRepositoryResolver: RevisionRepositoryResolverInterface
  let revision: Revision
  let event: ItemDumpedEvent

  const createHandler = () => new ItemDumpedEventHandler(dumpRepository, revisionRepositoryResolver)

  beforeEach(() => {
    revision = {} as jest.Mocked<Revision>

    dumpRepository = {} as jest.Mocked<DumpRepositoryInterface>
    dumpRepository.getRevisionFromDumpPath = jest.fn().mockReturnValue(revision)
    dumpRepository.removeDump = jest.fn()

    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.save = jest.fn()

    revisionRepositoryResolver = {} as jest.Mocked<RevisionRepositoryResolverInterface>
    revisionRepositoryResolver.resolve = jest.fn().mockReturnValue(revisionRepository)

    event = {} as jest.Mocked<ItemDumpedEvent>
    event.payload = {
      fileDumpPath: 'foobar',
      roleNames: ['CORE_USER'],
    }
  })

  it('should save a revision from file dump', async () => {
    await createHandler().handle(event)

    expect(revisionRepository.save).toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })

  it('should do nothing if role names are not valid', async () => {
    event.payload.roleNames = ['INVALID_ROLE_NAME']

    await createHandler().handle(event)

    expect(revisionRepository.save).not.toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })

  it('should not save a revision if it could not be created from dump', async () => {
    dumpRepository.getRevisionFromDumpPath = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(revisionRepository.save).not.toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })
})
