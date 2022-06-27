import 'reflect-metadata'

import { EmailMessageIdentifier } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'

import { DomainEventFactory } from './DomainEventFactory'
import { PredicateAuthority, PredicateName } from '@standardnotes/scheduler'
import { Job } from '../Job/Job'
import { Predicate } from '../Predicate/Predicate'

describe('DomainEventFactory', () => {
  let timer: TimerInterface

  const createFactory = () => new DomainEventFactory(timer)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(1))
  })

  it('should create a EMAIL_MESSAGE_REQUESTED event', () => {
    expect(
      createFactory().createEmailMessageRequestedEvent({
        userEmail: 'test@test.te',
        messageIdentifier: EmailMessageIdentifier.ENCOURAGE_EMAIL_BACKUPS,
        context: {
          foo: 'bar',
        },
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: 'test@test.te',
          userIdentifierType: 'email',
        },
        origin: 'scheduler',
      },
      payload: {
        messageIdentifier: 'ENCOURAGE_EMAIL_BACKUPS',
        userEmail: 'test@test.te',
        context: {
          foo: 'bar',
        },
      },
      type: 'EMAIL_MESSAGE_REQUESTED',
    })
  })

  it('should create a PREDICATE_VERIFICATION_REQUESTED event dedicated for auth', () => {
    expect(
      createFactory().createPredicateVerificationRequestedEvent(
        {
          uuid: '1-2-3',
          userIdentifier: '2-3-4',
          userIdentifierType: 'uuid',
        } as jest.Mocked<Job>,
        {
          authority: PredicateAuthority.Auth,
          name: PredicateName.EmailBackupsEnabled,
          status: 'pending',
        } as jest.Mocked<Predicate>,
      ),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '2-3-4',
          userIdentifierType: 'uuid',
        },
        origin: 'scheduler',
        target: 'auth',
      },
      payload: {
        predicate: {
          authority: 'auth',
          jobUuid: '1-2-3',
          name: 'email-backups-enabled',
        },
      },
      type: 'PREDICATE_VERIFICATION_REQUESTED',
    })
  })

  it('should create a PREDICATE_VERIFICATION_REQUESTED event dedicated for syncing server', () => {
    expect(
      createFactory().createPredicateVerificationRequestedEvent(
        {
          uuid: '1-2-3',
          userIdentifier: '2-3-4',
          userIdentifierType: 'uuid',
        } as jest.Mocked<Job>,
        {
          authority: PredicateAuthority.SyncingServer,
          name: PredicateName.EmailBackupsEnabled,
          status: 'pending',
        } as jest.Mocked<Predicate>,
      ),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '2-3-4',
          userIdentifierType: 'uuid',
        },
        origin: 'scheduler',
        target: 'syncing-server',
      },
      payload: {
        predicate: {
          authority: 'syncing-server',
          jobUuid: '1-2-3',
          name: 'email-backups-enabled',
        },
      },
      type: 'PREDICATE_VERIFICATION_REQUESTED',
    })
  })

  it('should create a PREDICATE_VERIFICATION_REQUESTED event dedicated for unknown target', () => {
    expect(
      createFactory().createPredicateVerificationRequestedEvent(
        {
          uuid: '1-2-3',
          userIdentifier: '2-3-4',
          userIdentifierType: 'uuid',
        } as jest.Mocked<Job>,
        {
          authority: 'foobar' as PredicateAuthority,
          name: PredicateName.EmailBackupsEnabled,
          status: 'pending',
        } as jest.Mocked<Predicate>,
      ),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '2-3-4',
          userIdentifierType: 'uuid',
        },
        origin: 'scheduler',
      },
      payload: {
        predicate: {
          authority: 'foobar',
          jobUuid: '1-2-3',
          name: 'email-backups-enabled',
        },
      },
      type: 'PREDICATE_VERIFICATION_REQUESTED',
    })
  })
})
