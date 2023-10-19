import { Uuid, ContentType, Dates, Result } from '@standardnotes/domain-core'

import { DumpRepositoryInterface } from '../../Dump/DumpRepositoryInterface'
import { Revision } from '../../Revision/Revision'
import { RevisionRepositoryInterface } from '../../Revision/RevisionRepositoryInterface'
import { CreateRevisionFromDump } from './CreateRevisionFromDump'

describe('CreateRevisionFromDump', () => {
  let revisionRepository: RevisionRepositoryInterface
  let revision: Revision
  let dumpRepository: DumpRepositoryInterface

  const createUseCase = () => new CreateRevisionFromDump(dumpRepository, revisionRepository)

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
    dumpRepository.getRevisionFromDumpPath = jest.fn().mockReturnValue(Result.ok(revision))
    dumpRepository.removeDump = jest.fn()

    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.insert = jest.fn().mockReturnValue(true)
  })

  it('should create a revision from file dump', async () => {
    const result = await createUseCase().execute({
      filePath: 'foobar',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(revisionRepository.insert).toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })

  it('should fail if file path is empty', async () => {
    const result = await createUseCase().execute({
      filePath: '',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(revisionRepository.insert).not.toHaveBeenCalled()
    expect(dumpRepository.removeDump).not.toHaveBeenCalled()
  })

  it('should fail if revision cannot be found', async () => {
    dumpRepository.getRevisionFromDumpPath = jest.fn().mockReturnValue(Result.fail('Oops'))

    const result = await createUseCase().execute({
      filePath: 'foobar',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(revisionRepository.insert).not.toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })

  it('should fail if revision cannot be inserted', async () => {
    revisionRepository.insert = jest.fn().mockReturnValue(false)

    const result = await createUseCase().execute({
      filePath: 'foobar',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(revisionRepository.insert).toHaveBeenCalled()
    expect(dumpRepository.removeDump).toHaveBeenCalled()
  })
})
