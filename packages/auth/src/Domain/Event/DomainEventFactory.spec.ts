import 'reflect-metadata'

import { EmailMessageIdentifier, ProtocolVersion, RoleName } from '@standardnotes/common'
import { PredicateName, PredicateAuthority, PredicateVerificationResult } from '@standardnotes/predicates'
import { TimerInterface } from '@standardnotes/time'

import { DomainEventFactory } from './DomainEventFactory'
import { InviteeIdentifierType } from '../SharedSubscription/InviteeIdentifierType'

describe('DomainEventFactory', () => {
  let timer: TimerInterface

  const createFactory = () => new DomainEventFactory(timer)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(1))
  })

  it('should create a EXIT_DISCOUNT_APPLY_REQUESTED event', () => {
    expect(
      createFactory().createExitDiscountApplyRequestedEvent({
        userEmail: 'test@test.te',
        discountCode: 'exit-20',
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: 'test@test.te',
          userIdentifierType: 'email',
        },
        origin: 'auth',
      },
      payload: {
        userEmail: 'test@test.te',
        discountCode: 'exit-20',
      },
      type: 'EXIT_DISCOUNT_APPLY_REQUESTED',
    })
  })

  it('should create a WEB_SOCKET_MESSAGE_REQUESTED event', () => {
    expect(
      createFactory().createWebSocketMessageRequestedEvent({
        userUuid: '1-2-3',
        message: 'foobar',
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        userUuid: '1-2-3',
        message: 'foobar',
      },
      type: 'WEB_SOCKET_MESSAGE_REQUESTED',
    })
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
        origin: 'auth',
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

  it('should create a PREDICATE_VERIFIED event', () => {
    expect(
      createFactory().createPredicateVerifiedEvent({
        predicate: {
          authority: PredicateAuthority.Auth,
          jobUuid: '1-2-3',
          name: PredicateName.EmailBackupsEnabled,
        },
        predicateVerificationResult: PredicateVerificationResult.Affirmed,
        userUuid: '2-3-4',
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '2-3-4',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        predicate: {
          authority: 'auth',
          jobUuid: '1-2-3',
          name: 'email-backups-enabled',
        },
        predicateVerificationResult: 'affirmed',
      },
      type: 'PREDICATE_VERIFIED',
    })
  })

  it('should create a SHARED_SUBSCRIPTION_INVITATION_CANCELED event', () => {
    expect(
      createFactory().createSharedSubscriptionInvitationCanceledEvent({
        inviterEmail: 'test@test.te',
        inviterSubscriptionId: 1,
        inviterSubscriptionUuid: '2-3-4',
        inviteeIdentifier: 'invitee@test.te',
        inviteeIdentifierType: InviteeIdentifierType.Email,
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: 'test@test.te',
          userIdentifierType: 'email',
        },
        origin: 'auth',
      },
      payload: {
        inviterEmail: 'test@test.te',
        inviterSubscriptionId: 1,
        inviterSubscriptionUuid: '2-3-4',
        inviteeIdentifier: 'invitee@test.te',
        inviteeIdentifierType: InviteeIdentifierType.Email,
        sharedSubscriptionInvitationUuid: '1-2-3',
      },
      type: 'SHARED_SUBSCRIPTION_INVITATION_CANCELED',
    })
  })

  it('should create a SHARED_SUBSCRIPTION_INVITATION_CREATED event', () => {
    expect(
      createFactory().createSharedSubscriptionInvitationCreatedEvent({
        inviterEmail: 'test@test.te',
        inviterSubscriptionId: 1,
        inviteeIdentifier: 'invitee@test.te',
        inviteeIdentifierType: InviteeIdentifierType.Email,
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: 'test@test.te',
          userIdentifierType: 'email',
        },
        origin: 'auth',
      },
      payload: {
        inviterEmail: 'test@test.te',
        inviterSubscriptionId: 1,
        inviteeIdentifier: 'invitee@test.te',
        inviteeIdentifierType: InviteeIdentifierType.Email,
        sharedSubscriptionInvitationUuid: '1-2-3',
      },
      type: 'SHARED_SUBSCRIPTION_INVITATION_CREATED',
    })
  })

  it('should create a USER_DISABLED_SESSION_USER_AGENT_LOGGING event', () => {
    expect(
      createFactory().createUserDisabledSessionUserAgentLoggingEvent({
        email: 'test@test.te',
        userUuid: '1-2-3',
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        userUuid: '1-2-3',
        email: 'test@test.te',
      },
      type: 'USER_DISABLED_SESSION_USER_AGENT_LOGGING',
    })
  })

  it('should create a USER_SIGNED_IN event', () => {
    expect(
      createFactory().createUserSignedInEvent({
        browser: 'Firefox 1',
        device: 'iOS 1',
        userEmail: 'test@test.te',
        userUuid: '1-2-3',
        signInAlertEnabled: true,
        muteSignInEmailsSettingUuid: '2-3-4',
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        userUuid: '1-2-3',
        userEmail: 'test@test.te',
        browser: 'Firefox 1',
        device: 'iOS 1',
        signInAlertEnabled: true,
        muteSignInEmailsSettingUuid: '2-3-4',
      },
      type: 'USER_SIGNED_IN',
    })
  })

  it('should create a LISTED_ACCOUNT_REQUESTED event', () => {
    expect(createFactory().createListedAccountRequestedEvent('1-2-3', 'test@test.te')).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        userUuid: '1-2-3',
        userEmail: 'test@test.te',
      },
      type: 'LISTED_ACCOUNT_REQUESTED',
    })
  })

  it('should create a USER_REGISTERED event', () => {
    expect(
      createFactory().createUserRegisteredEvent({
        userUuid: '1-2-3',
        email: 'test@test.te',
        protocolVersion: ProtocolVersion.V004,
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        userUuid: '1-2-3',
        email: 'test@test.te',
        protocolVersion: '004',
      },
      type: 'USER_REGISTERED',
    })
  })

  it('should create a OFFLINE_SUBSCRIPTION_TOKEN_CREATED event', () => {
    expect(createFactory().createOfflineSubscriptionTokenCreatedEvent('1-2-3', 'test@test.te')).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: 'test@test.te',
          userIdentifierType: 'email',
        },
        origin: 'auth',
      },
      payload: {
        token: '1-2-3',
        email: 'test@test.te',
      },
      type: 'OFFLINE_SUBSCRIPTION_TOKEN_CREATED',
    })
  })

  it('should create a USER_CHANGED_EMAIL event', () => {
    expect(createFactory().createUserEmailChangedEvent('1-2-3', 'test@test.te', 'test2@test.te')).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        userUuid: '1-2-3',
        fromEmail: 'test@test.te',
        toEmail: 'test2@test.te',
      },
      type: 'USER_EMAIL_CHANGED',
    })
  })

  it('should create a CLOUD_BACKUP_REQUESTED event', () => {
    expect(createFactory().createCloudBackupRequestedEvent('GOOGLE_DRIVE', 'test', '1-2-3', '2-3-4', true)).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        cloudProvider: 'GOOGLE_DRIVE',
        cloudProviderToken: 'test',
        userUuid: '1-2-3',
        muteEmailsSettingUuid: '2-3-4',
        userHasEmailsMuted: true,
      },
      type: 'CLOUD_BACKUP_REQUESTED',
    })
  })

  it('should create a EMAIL_BACKUP_REQUESTED event', () => {
    expect(createFactory().createEmailBackupRequestedEvent('1-2-3', '2-3-4', true)).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        userUuid: '1-2-3',
        muteEmailsSettingUuid: '2-3-4',
        userHasEmailsMuted: true,
      },
      type: 'EMAIL_BACKUP_REQUESTED',
    })
  })

  it('should create a ACCOUNT_DELETION_REQUESTED event', () => {
    expect(
      createFactory().createAccountDeletionRequestedEvent({
        userUuid: '1-2-3',
        regularSubscriptionUuid: '2-3-4',
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        userUuid: '1-2-3',
        regularSubscriptionUuid: '2-3-4',
      },
      type: 'ACCOUNT_DELETION_REQUESTED',
    })
  })

  it('should create a USER_ROLE_CHANGED event', () => {
    expect(createFactory().createUserRolesChangedEvent('1-2-3', 'test@test.com', [RoleName.ProUser])).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'auth',
      },
      payload: {
        userUuid: '1-2-3',
        email: 'test@test.com',
        currentRoles: [RoleName.ProUser],
        timestamp: expect.any(Number),
      },
      type: 'USER_ROLES_CHANGED',
    })
  })
})
