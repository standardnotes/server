import { PredicateVerifiedEvent } from '@standardnotes/domain-events'
import { PredicateAuthority, PredicateName, PredicateVerificationResult } from '@standardnotes/predicates'
import 'reflect-metadata'
import { Logger } from 'winston'
import { UpdatePredicateStatus } from '../UseCase/UpdatePredicateStatus/UpdatePredicateStatus'

import { PredicateVerifiedEventHandler } from './PredicateVerifiedEventHandler'

describe('PredicateVerifiedEventHandler', () => {
  let updatePredicateStatus: UpdatePredicateStatus
  let logger: Logger
  let event: PredicateVerifiedEvent

  const createHandler = () => new PredicateVerifiedEventHandler(updatePredicateStatus, logger)

  beforeEach(() => {
    updatePredicateStatus = {} as jest.Mocked<UpdatePredicateStatus>
    updatePredicateStatus.execute = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    event = {} as jest.Mocked<PredicateVerifiedEvent>
    event.payload = {
      predicate: {
        name: PredicateName.EmailBackupsEnabled,
        jobUuid: '1-2-3',
        authority: PredicateAuthority.Auth,
      },
      predicateVerificationResult: PredicateVerificationResult.Affirmed,
    }
  })

  it('should update predicate status', async () => {
    await createHandler().handle(event)

    expect(updatePredicateStatus.execute).toHaveBeenCalled()
  })
})
