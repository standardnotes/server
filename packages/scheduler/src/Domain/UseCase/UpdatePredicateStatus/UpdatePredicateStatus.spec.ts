import 'reflect-metadata'

import { PredicateAuthority, PredicateName, PredicateVerificationResult } from '@standardnotes/predicates'

import { Predicate } from '../../Predicate/Predicate'
import { PredicateRepositoryInterface } from '../../Predicate/PredicateRepositoryInterface'
import { PredicateStatus } from '../../Predicate/PredicateStatus'

import { UpdatePredicateStatus } from './UpdatePredicateStatus'

describe('UpdatePredicateStatus', () => {
  let predicateRepository: PredicateRepositoryInterface
  let predicateComplete: Predicate
  let predicateIncomplete: Predicate

  const createUseCase = () => new UpdatePredicateStatus(predicateRepository)

  beforeEach(() => {
    predicateComplete = {
      uuid: '1-2-3',
      name: PredicateName.SubscriptionPurchased,
      status: PredicateStatus.Affirmed,
    } as jest.Mocked<Predicate>
    predicateIncomplete = {
      uuid: '2-3-4',
      name: PredicateName.EmailBackupsEnabled,
      status: PredicateStatus.Pending,
    } as jest.Mocked<Predicate>

    predicateRepository = {} as jest.Mocked<PredicateRepositoryInterface>
    predicateRepository.findByJobUuid = jest.fn().mockReturnValue([predicateComplete, predicateIncomplete])
    predicateRepository.save = jest.fn()
  })

  it('should mark a predicate as complete', async () => {
    expect(
      await createUseCase().execute({
        predicate: { name: PredicateName.EmailBackupsEnabled, jobUuid: '1-2-3', authority: PredicateAuthority.Auth },
        predicateVerificationResult: PredicateVerificationResult.Denied,
      }),
    ).toEqual({
      success: true,
    })

    expect(predicateRepository.save).toHaveBeenCalledWith({
      uuid: '2-3-4',
      name: 'email-backups-enabled',
      status: 'denied',
    })
  })
})
