import 'reflect-metadata'

import { AccountDeletionRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { AccountDeletionRequestedEventHandler } from './AccountDeletionRequestedEventHandler'
import { RevisionRepositoryInterface } from '../Revision/RevisionRepositoryInterface'
import { RevisionRepositoryResolverInterface } from '../Revision/RevisionRepositoryResolverInterface'

describe('AccountDeletionRequestedEventHandler', () => {
  let revisionRepository: RevisionRepositoryInterface
  let revisionRepositoryResolver: RevisionRepositoryResolverInterface
  let logger: Logger
  let event: AccountDeletionRequestedEvent

  const createHandler = () => new AccountDeletionRequestedEventHandler(revisionRepositoryResolver, logger)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.removeByUserUuid = jest.fn()

    revisionRepositoryResolver = {} as jest.Mocked<RevisionRepositoryResolverInterface>
    revisionRepositoryResolver.resolve = jest.fn().mockReturnValue(revisionRepository)

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()

    event = {} as jest.Mocked<AccountDeletionRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '2-3-4',
      userCreatedAtTimestamp: 1,
      regularSubscriptionUuid: '1-2-3',
      roleNames: ['CORE_USER'],
    }
  })

  it('should remove all revisions for a user', async () => {
    event.payload.userUuid = '84c0f8e8-544a-4c7e-9adf-26209303bc1d'

    await createHandler().handle(event)

    expect(revisionRepository.removeByUserUuid).toHaveBeenCalled()
  })

  it('should not remove all revisions for an invalid user uuid', async () => {
    await createHandler().handle(event)

    expect(revisionRepository.removeByUserUuid).not.toHaveBeenCalled()
  })

  it('should do nothing if role names are not valid', async () => {
    event.payload.userUuid = '84c0f8e8-544a-4c7e-9adf-26209303bc1d'
    event.payload.roleNames = ['INVALID_ROLE_NAME']

    await createHandler().handle(event)

    expect(revisionRepository.removeByUserUuid).not.toHaveBeenCalled()
  })
})
