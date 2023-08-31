import { Logger } from 'winston'

import { RevisionRepositoryInterface } from '../../../Revision/RevisionRepositoryInterface'
import { TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser } from './TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser'
import { Revision } from '../../../Revision/Revision'
import { ContentType, Dates, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

describe('TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser', () => {
  let primaryRevisionRepository: RevisionRepositoryInterface
  let secondaryRevisionRepository: RevisionRepositoryInterface | null
  let logger: Logger
  let primaryRevision1: Revision
  let primaryRevision2: Revision
  let secondaryRevision1: Revision
  let secondaryRevision2: Revision
  let timer: TimerInterface

  const createUseCase = () =>
    new TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser(
      primaryRevisionRepository,
      secondaryRevisionRepository,
      timer,
      logger,
    )

  beforeEach(() => {
    primaryRevision1 = Revision.create(
      {
        itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        content: 'test',
        contentType: ContentType.create('Note').getValue(),
        itemsKeyId: 'test',
        encItemKey: 'test',
        authHash: 'test',
        creationDate: new Date(1),
        dates: Dates.create(new Date(1), new Date(2)).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    primaryRevision2 = Revision.create(
      {
        itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc2d').getValue(),
        userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        content: 'test',
        contentType: ContentType.create('Note').getValue(),
        itemsKeyId: 'test',
        encItemKey: 'test',
        authHash: 'test',
        creationDate: new Date(1),
        dates: Dates.create(new Date(1), new Date(2)).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
    ).getValue()

    secondaryRevision1 = Revision.create(
      {
        itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        content: 'test',
        contentType: ContentType.create('Note').getValue(),
        itemsKeyId: 'test',
        encItemKey: 'test',
        authHash: 'test',
        creationDate: new Date(1),
        dates: Dates.create(new Date(1), new Date(2)).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    secondaryRevision2 = Revision.create(
      {
        itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc2d').getValue(),
        userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        content: 'test',
        contentType: ContentType.create('Note').getValue(),
        itemsKeyId: 'test',
        encItemKey: 'test',
        authHash: 'test',
        creationDate: new Date(1),
        dates: Dates.create(new Date(1), new Date(2)).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
    ).getValue()

    primaryRevisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    primaryRevisionRepository.countByUserUuid = jest.fn().mockResolvedValue(2)
    primaryRevisionRepository.findByUserUuid = jest
      .fn()
      .mockResolvedValueOnce([primaryRevision1])
      .mockResolvedValueOnce([primaryRevision2])
      .mockResolvedValueOnce([primaryRevision1])
      .mockResolvedValueOnce([primaryRevision2])
    primaryRevisionRepository.removeByUserUuid = jest.fn().mockResolvedValue(undefined)

    secondaryRevisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    secondaryRevisionRepository.save = jest.fn().mockResolvedValue(true)
    secondaryRevisionRepository.removeByUserUuid = jest.fn().mockResolvedValue(undefined)
    secondaryRevisionRepository.countByUserUuid = jest.fn().mockResolvedValue(2)
    secondaryRevisionRepository.findOneByUuid = jest
      .fn()
      .mockResolvedValueOnce(secondaryRevision1)
      .mockResolvedValueOnce(secondaryRevision2)

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
    logger.info = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.sleep = jest.fn()
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)
    timer.convertMicrosecondsToTimeStructure = jest.fn().mockReturnValue({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    })
  })

  describe('successfull transition', () => {
    it('should transition Revisions from primary to secondary database', async () => {
      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeFalsy()

      expect(primaryRevisionRepository.countByUserUuid).toHaveBeenCalledTimes(2)
      expect(primaryRevisionRepository.countByUserUuid).toHaveBeenCalledWith(
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )
      expect(primaryRevisionRepository.findByUserUuid).toHaveBeenCalledTimes(4)
      expect(primaryRevisionRepository.findByUserUuid).toHaveBeenNthCalledWith(1, {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        limit: 1,
        offset: 0,
      })
      expect(primaryRevisionRepository.findByUserUuid).toHaveBeenNthCalledWith(2, {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        limit: 1,
        offset: 1,
      })
      expect(primaryRevisionRepository.findByUserUuid).toHaveBeenNthCalledWith(3, {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        limit: 1,
        offset: 0,
      })
      expect(primaryRevisionRepository.findByUserUuid).toHaveBeenNthCalledWith(4, {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        limit: 1,
        offset: 1,
      })
      expect((secondaryRevisionRepository as RevisionRepositoryInterface).save).toHaveBeenCalledTimes(2)
      expect((secondaryRevisionRepository as RevisionRepositoryInterface).save).toHaveBeenCalledWith(primaryRevision1)
      expect((secondaryRevisionRepository as RevisionRepositoryInterface).save).toHaveBeenCalledWith(primaryRevision2)
      expect((secondaryRevisionRepository as RevisionRepositoryInterface).removeByUserUuid).not.toHaveBeenCalled()
      expect(primaryRevisionRepository.removeByUserUuid).toHaveBeenCalledTimes(1)
    })

    it('should log an error if deleting Revisions from primary database fails', async () => {
      primaryRevisionRepository.removeByUserUuid = jest.fn().mockRejectedValue(new Error('error'))

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeFalsy()

      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to clean up primary database revisions for user 00000000-0000-0000-0000-000000000000: error',
      )
    })
  })

  describe('failed transition', () => {
    it('should remove Revisions from secondary database if integrity check fails', async () => {
      const secondaryRevision2WithDifferentContent = Revision.create({
        ...secondaryRevision2.props,
        content: 'different-content',
      }).getValue()

      ;(secondaryRevisionRepository as RevisionRepositoryInterface).findOneByUuid = jest
        .fn()
        .mockResolvedValueOnce(secondaryRevision1)
        .mockResolvedValueOnce(secondaryRevision2WithDifferentContent)

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual(
        'Revision 00000000-0000-0000-0000-000000000001 is not identical in primary and secondary database',
      )

      expect((secondaryRevisionRepository as RevisionRepositoryInterface).removeByUserUuid).toHaveBeenCalledTimes(1)
      expect(primaryRevisionRepository.removeByUserUuid).not.toHaveBeenCalled()
    })

    it('should remove Revisions from secondary database if migrating Revisions fails', async () => {
      primaryRevisionRepository.findByUserUuid = jest
        .fn()
        .mockResolvedValueOnce([primaryRevision1])
        .mockRejectedValueOnce(new Error('error'))

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('error')

      expect((secondaryRevisionRepository as RevisionRepositoryInterface).removeByUserUuid).toHaveBeenCalledTimes(1)
      expect(primaryRevisionRepository.removeByUserUuid).not.toHaveBeenCalled()
    })

    it('should log an error if deleting Revisions from secondary database fails upon migration failure', async () => {
      primaryRevisionRepository.findByUserUuid = jest
        .fn()
        .mockResolvedValueOnce([primaryRevision1])
        .mockRejectedValueOnce(new Error('error'))
      ;(secondaryRevisionRepository as RevisionRepositoryInterface).removeByUserUuid = jest
        .fn()
        .mockRejectedValue(new Error('error'))

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()

      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to clean up secondary database revisions for user 00000000-0000-0000-0000-000000000000: error',
      )
    })

    it('should log an error if deleting Revisions from secondary database fails upon integrity check failure', async () => {
      const secondaryRevision2WithDifferentContent = Revision.create({
        ...secondaryRevision2.props,
        content: 'different-content',
      }).getValue()

      ;(secondaryRevisionRepository as RevisionRepositoryInterface).findOneByUuid = jest
        .fn()
        .mockResolvedValueOnce(secondaryRevision1)
        .mockResolvedValueOnce(secondaryRevision2WithDifferentContent)
      ;(secondaryRevisionRepository as RevisionRepositoryInterface).removeByUserUuid = jest
        .fn()
        .mockRejectedValue(new Error('error'))

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()

      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to clean up secondary database revisions for user 00000000-0000-0000-0000-000000000000: error',
      )
    })

    it('should not perform the transition if secondary Revision repository is not set', async () => {
      secondaryRevisionRepository = null

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Secondary revision repository is not set')

      expect(primaryRevisionRepository.countByUserUuid).not.toHaveBeenCalled()
      expect(primaryRevisionRepository.findByUserUuid).not.toHaveBeenCalled()
      expect(primaryRevisionRepository.removeByUserUuid).not.toHaveBeenCalled()
    })

    it('should not perform the transition if the user uuid is invalid', async () => {
      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: 'invalid-uuid',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Given value is not a valid uuid: invalid-uuid')

      expect(primaryRevisionRepository.countByUserUuid).not.toHaveBeenCalled()
      expect(primaryRevisionRepository.findByUserUuid).not.toHaveBeenCalled()
      expect(primaryRevisionRepository.removeByUserUuid).not.toHaveBeenCalled()
    })

    it('should fail integrity check if the Revision count is not the same in both databases', async () => {
      ;(secondaryRevisionRepository as RevisionRepositoryInterface).countByUserUuid = jest.fn().mockResolvedValue(1)

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual(
        'Total revisions count for user 00000000-0000-0000-0000-000000000000 in primary database (2) does not match total revisions count in secondary database (1)',
      )

      expect(primaryRevisionRepository.countByUserUuid).toHaveBeenCalledTimes(2)
      expect(primaryRevisionRepository.countByUserUuid).toHaveBeenCalledWith(
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )
      expect((secondaryRevisionRepository as RevisionRepositoryInterface).countByUserUuid).toHaveBeenCalledTimes(1)
      expect(primaryRevisionRepository.removeByUserUuid).not.toHaveBeenCalled()
      expect((secondaryRevisionRepository as RevisionRepositoryInterface).removeByUserUuid).toHaveBeenCalledTimes(1)
    })

    it('should fail if one Revision is not found in the secondary database', async () => {
      ;(secondaryRevisionRepository as RevisionRepositoryInterface).findOneByUuid = jest
        .fn()
        .mockResolvedValueOnce(secondaryRevision1)
        .mockResolvedValueOnce(null)

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Revision 00000000-0000-0000-0000-000000000001 not found in secondary database')

      expect(primaryRevisionRepository.countByUserUuid).toHaveBeenCalledTimes(2)
      expect(primaryRevisionRepository.countByUserUuid).toHaveBeenCalledWith(
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )
      expect((secondaryRevisionRepository as RevisionRepositoryInterface).countByUserUuid).not.toHaveBeenCalled()
      expect(primaryRevisionRepository.removeByUserUuid).not.toHaveBeenCalled()
      expect((secondaryRevisionRepository as RevisionRepositoryInterface).removeByUserUuid).toHaveBeenCalledTimes(1)
    })

    it('should fail if an error is thrown during integrity check between primary and secondary database', async () => {
      ;(secondaryRevisionRepository as RevisionRepositoryInterface).countByUserUuid = jest
        .fn()
        .mockRejectedValue(new Error('error'))

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('error')

      expect(primaryRevisionRepository.removeByUserUuid).not.toHaveBeenCalled()
      expect((secondaryRevisionRepository as RevisionRepositoryInterface).removeByUserUuid).toHaveBeenCalledTimes(1)
    })

    it('should fail if a revisions did not save in the secondary database', async () => {
      ;(secondaryRevisionRepository as RevisionRepositoryInterface).save = jest.fn().mockResolvedValue(false)

      const useCase = createUseCase()

      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual(
        'Failed to save revision 00000000-0000-0000-0000-000000000000 to secondary database',
      )

      expect(primaryRevisionRepository.removeByUserUuid).not.toHaveBeenCalled()
      expect((secondaryRevisionRepository as RevisionRepositoryInterface).removeByUserUuid).toHaveBeenCalledTimes(1)
    })
  })
})
