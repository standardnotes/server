import { ItemDumpedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { Uuid, ContentType, Dates } from '@standardnotes/domain-core'

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
  let logger: Logger

  const createHandler = () => new ItemDumpedEventHandler(dumpRepository, revisionRepositoryResolver, logger)

  beforeEach(() => {
    revision = Revision.create({
      itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
      userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
      content: 'test',
      contentType: ContentType.create('Note').getValue(),
      itemsKeyId: 'test',
      encItemKey: 'test',
      authHash: 'test',
      creationDate: new Date(1),
      dates: Dates.create(new Date(1), new Date(2)).getValue(),
    }).getValue()

    dumpRepository = {} as jest.Mocked<DumpRepositoryInterface>
    dumpRepository.getRevisionFromDumpPath = jest.fn().mockReturnValue(revision)
    dumpRepository.removeDump = jest.fn()

    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.insert = jest.fn()

    revisionRepositoryResolver = {} as jest.Mocked<RevisionRepositoryResolverInterface>
    revisionRepositoryResolver.resolve = jest.fn().mockReturnValue(revisionRepository)

    event = {} as jest.Mocked<ItemDumpedEvent>
    event.payload = {
      fileDumpPath: 'foobar',
      roleNames: ['CORE_USER'],
    }

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
  })

  it('should save a revision from file dump', async () => {
    await createHandler().handle(event)

    expect(revisionRepository.insert).toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })

  it('should do nothing if role names are not valid', async () => {
    event.payload.roleNames = ['INVALID_ROLE_NAME']

    await createHandler().handle(event)

    expect(revisionRepository.insert).not.toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })

  it('should not save a revision if it could not be created from dump', async () => {
    dumpRepository.getRevisionFromDumpPath = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(revisionRepository.insert).not.toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })
})
