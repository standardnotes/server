/* istanbul ignore file */

import { ProtocolVersion } from '@standardnotes/common'
import {
  AccountDeletionRequestedEvent,
  UserEmailChangedEvent,
  UserRegisteredEvent,
  UserRolesChangedEvent,
  EmailBackupRequestedEvent,
  ListedAccountRequestedEvent,
  UserDisabledSessionUserAgentLoggingEvent,
  SharedSubscriptionInvitationCreatedEvent,
  SharedSubscriptionInvitationCanceledEvent,
  PredicateVerifiedEvent,
  DomainEventService,
  WebSocketMessageRequestedEvent,
  ExitDiscountApplyRequestedEvent,
  MuteEmailsSettingChangedEvent,
  EmailRequestedEvent,
  StatisticPersistenceRequestedEvent,
  SessionCreatedEvent,
  SessionRefreshedEvent,
  TransitionRequestedEvent,
} from '@standardnotes/domain-events'
import { Predicate, PredicateVerificationResult } from '@standardnotes/predicates'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { InviteeIdentifierType } from '../SharedSubscription/InviteeIdentifierType'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'
import { KeyParamsData } from '@standardnotes/responses'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(@inject(TYPES.Auth_Timer) private timer: TimerInterface) {}

  createTransitionRequestedEvent(dto: {
    userUuid: string
    type: 'items' | 'revisions'
    timestamp: number
  }): TransitionRequestedEvent {
    return {
      type: 'TRANSITION_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createSessionCreatedEvent(dto: { userUuid: string }): SessionCreatedEvent {
    return {
      type: 'SESSION_CREATED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createSessionRefreshedEvent(dto: { userUuid: string }): SessionRefreshedEvent {
    return {
      type: 'SESSION_REFRESHED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createStatisticPersistenceRequestedEvent(dto: {
    statisticMeasureName: string
    value: number
    date: number
  }): StatisticPersistenceRequestedEvent {
    return {
      type: 'STATISTIC_PERSISTENCE_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: '-',
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createMuteEmailsSettingChangedEvent(dto: {
    username: string
    mute: boolean
    emailSubscriptionRejectionLevel: string
  }): MuteEmailsSettingChangedEvent {
    return {
      type: 'MUTE_EMAILS_SETTING_CHANGED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.username,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createExitDiscountApplyRequestedEvent(dto: {
    userEmail: string
    discountCode: string
  }): ExitDiscountApplyRequestedEvent {
    return {
      type: 'EXIT_DISCOUNT_APPLY_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userEmail,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createWebSocketMessageRequestedEvent(dto: { userUuid: string; message: string }): WebSocketMessageRequestedEvent {
    return {
      type: 'WEB_SOCKET_MESSAGE_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createEmailRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: string
    level: string
    body: string
    subject: string
  }): EmailRequestedEvent {
    return {
      type: 'EMAIL_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userEmail,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createPredicateVerifiedEvent(dto: {
    userUuid: string
    predicate: Predicate
    predicateVerificationResult: PredicateVerificationResult
  }): PredicateVerifiedEvent {
    const { userUuid, ...payload } = dto
    return {
      type: 'PREDICATE_VERIFIED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload,
    }
  }

  createSharedSubscriptionInvitationCanceledEvent(dto: {
    inviterEmail: string
    inviterSubscriptionId: number
    inviterSubscriptionUuid: string
    inviteeIdentifier: string
    inviteeIdentifierType: InviteeIdentifierType
    sharedSubscriptionInvitationUuid: string
  }): SharedSubscriptionInvitationCanceledEvent {
    return {
      type: 'SHARED_SUBSCRIPTION_INVITATION_CANCELED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.inviterEmail,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createSharedSubscriptionInvitationCreatedEvent(dto: {
    inviterEmail: string
    inviterSubscriptionId: number
    inviteeIdentifier: string
    inviteeIdentifierType: InviteeIdentifierType
    sharedSubscriptionInvitationUuid: string
  }): SharedSubscriptionInvitationCreatedEvent {
    return {
      type: 'SHARED_SUBSCRIPTION_INVITATION_CREATED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.inviterEmail,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createUserDisabledSessionUserAgentLoggingEvent(dto: {
    userUuid: string
    email: string
  }): UserDisabledSessionUserAgentLoggingEvent {
    return {
      type: 'USER_DISABLED_SESSION_USER_AGENT_LOGGING',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createListedAccountRequestedEvent(userUuid: string, userEmail: string): ListedAccountRequestedEvent {
    return {
      type: 'LISTED_ACCOUNT_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: {
        userUuid,
        userEmail,
      },
    }
  }

  createEmailBackupRequestedEvent(
    userUuid: string,
    muteEmailsSettingUuid: string,
    userHasEmailsMuted: boolean,
    keyParams: KeyParamsData,
  ): EmailBackupRequestedEvent {
    return {
      type: 'EMAIL_BACKUP_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: {
        userUuid,
        userHasEmailsMuted,
        muteEmailsSettingUuid,
        keyParams,
      },
    }
  }

  createAccountDeletionRequestedEvent(dto: {
    userUuid: string
    userCreatedAtTimestamp: number
    regularSubscriptionUuid: string | undefined
    roleNames: string[]
  }): AccountDeletionRequestedEvent {
    return {
      type: 'ACCOUNT_DELETION_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createUserRegisteredEvent(dto: {
    userUuid: string
    email: string
    protocolVersion: ProtocolVersion
  }): UserRegisteredEvent {
    return {
      type: 'USER_REGISTERED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: dto,
    }
  }

  createUserEmailChangedEvent(userUuid: string, fromEmail: string, toEmail: string): UserEmailChangedEvent {
    return {
      type: 'USER_EMAIL_CHANGED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: {
        userUuid,
        fromEmail,
        toEmail,
      },
    }
  }

  createUserRolesChangedEvent(userUuid: string, email: string, currentRoles: string[]): UserRolesChangedEvent {
    return {
      type: 'USER_ROLES_CHANGED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Auth,
      },
      payload: {
        userUuid,
        email,
        currentRoles,
        timestamp: this.timer.getTimestampInMicroseconds(),
      },
    }
  }
}
