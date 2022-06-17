import { PredicateAuthority, PredicateName, PredicateVerificationResult } from '@standardnotes/scheduler'
import 'reflect-metadata'

import { JobDoneInterpreterInterface } from '../../Job/JobDoneInterpreterInterface'
import { JobRepositoryInterface } from '../../Job/JobRepositoryInterface'
import { Predicate } from '../../Predicate/Predicate'
import { PredicateRepositoryInterface } from '../../Predicate/PredicateRepositoryInterface'
import { PredicateStatus } from '../../Predicate/PredicateStatus'

import { UpdatePredicateStatus } from './UpdatePredicateStatus'

describe('UpdatePredicateStatus', () => {
  let predicateRepository: PredicateRepositoryInterface
  let jobRepository: JobRepositoryInterface
  let jobDoneInterpreter: JobDoneInterpreterInterface
  let predicateComplete: Predicate
  let predicateIncomplete: Predicate

  const createUseCase = () => new UpdatePredicateStatus(predicateRepository, jobRepository, jobDoneInterpreter)

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

    jobRepository = {} as jest.Mocked<JobRepositoryInterface>
    jobRepository.markJobAsDone = jest.fn()

    jobDoneInterpreter = {} as jest.Mocked<JobDoneInterpreterInterface>
    jobDoneInterpreter.interpret = jest.fn()
  })

  it('should mark a predicate as complete and update job as done', async () => {
    expect(
      await createUseCase().execute({
        predicate: { name: PredicateName.EmailBackupsEnabled, jobUuid: '1-2-3', authority: PredicateAuthority.Auth },
        predicateVerificationResult: PredicateVerificationResult.Denied,
      }),
    ).toEqual({
      success: true,
      allPredicatesChecked: true,
    })

    expect(predicateRepository.save).toHaveBeenCalledWith({
      uuid: '2-3-4',
      name: 'email-backups-enabled',
      status: 'denied',
    })

    expect(jobRepository.markJobAsDone).toHaveBeenCalled()
    expect(jobDoneInterpreter.interpret).toHaveBeenCalled()
  })

  it('should mark a predicate as complete and not update job as done if there are still incomplete predicates', async () => {
    predicateRepository.findByJobUuid = jest
      .fn()
      .mockReturnValue([
        predicateComplete,
        predicateIncomplete,
        { uuid: '3-4-5', status: PredicateStatus.Pending } as jest.Mocked<Predicate>,
      ])

    expect(
      await createUseCase().execute({
        predicate: { name: PredicateName.EmailBackupsEnabled, jobUuid: '1-2-3', authority: PredicateAuthority.Auth },
        predicateVerificationResult: PredicateVerificationResult.Denied,
      }),
    ).toEqual({
      success: true,
      allPredicatesChecked: false,
    })

    expect(predicateRepository.save).toHaveBeenCalledWith({
      uuid: '2-3-4',
      name: 'email-backups-enabled',
      status: 'denied',
    })

    expect(jobRepository.markJobAsDone).not.toHaveBeenCalled()
    expect(jobDoneInterpreter.interpret).not.toHaveBeenCalled()
  })
})
