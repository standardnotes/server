import { ProtocolVersion, JSONString } from '@standardnotes/common'
import { Predicate, PredicateVerificationResult } from '@standardnotes/predicates'
import {
  AccountDeletionRequestedEvent,
  UserRegisteredEvent,
  UserRolesChangedEvent,
  UserEmailChangedEvent,
  EmailBackupRequestedEvent,
  ListedAccountRequestedEvent,
  UserDisabledSessionUserAgentLoggingEvent,
  SharedSubscriptionInvitationCreatedEvent,
  SharedSubscriptionInvitationCanceledEvent,
  PredicateVerifiedEvent,
  WebSocketMessageRequestedEvent,
  ExitDiscountApplyRequestedEvent,
  MuteEmailsSettingChangedEvent,
  EmailRequestedEvent,
  StatisticPersistenceRequestedEvent,
  SessionCreatedEvent,
  SessionRefreshedEvent,
} from '@standardnotes/domain-events'
import { InviteeIdentifierType } from '../SharedSubscription/InviteeIdentifierType'

export interface DomainEventFactoryInterface {
  createWebSocketMessageRequestedEvent(dto: { userUuid: string; message: JSONString }): WebSocketMessageRequestedEvent
  createEmailRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: string
    level: string
    body: string
    subject: string
  }): EmailRequestedEvent
  createListedAccountRequestedEvent(userUuid: string, userEmail: string): ListedAccountRequestedEvent
  createUserRegisteredEvent(dto: {
    userUuid: string
    email: string
    protocolVersion: ProtocolVersion
  }): UserRegisteredEvent
  createEmailBackupRequestedEvent(
    userUuid: string,
    muteEmailsSettingUuid: string,
    userHasEmailsMuted: boolean,
  ): EmailBackupRequestedEvent
  createAccountDeletionRequestedEvent(dto: {
    userUuid: string
    userCreatedAtTimestamp: number
    regularSubscriptionUuid: string | undefined
    roleNames: string[]
  }): AccountDeletionRequestedEvent
  createUserRolesChangedEvent(userUuid: string, email: string, currentRoles: string[]): UserRolesChangedEvent
  createUserEmailChangedEvent(userUuid: string, fromEmail: string, toEmail: string): UserEmailChangedEvent
  createUserDisabledSessionUserAgentLoggingEvent(dto: {
    userUuid: string
    email: string
  }): UserDisabledSessionUserAgentLoggingEvent
  createSharedSubscriptionInvitationCreatedEvent(dto: {
    inviterEmail: string
    inviterSubscriptionId: number
    inviteeIdentifier: string
    inviteeIdentifierType: InviteeIdentifierType
    sharedSubscriptionInvitationUuid: string
  }): SharedSubscriptionInvitationCreatedEvent
  createSharedSubscriptionInvitationCanceledEvent(dto: {
    inviterEmail: string
    inviterSubscriptionId: number
    inviterSubscriptionUuid: string
    inviteeIdentifier: string
    inviteeIdentifierType: InviteeIdentifierType
    sharedSubscriptionInvitationUuid: string
  }): SharedSubscriptionInvitationCanceledEvent
  createPredicateVerifiedEvent(dto: {
    userUuid: string
    predicate: Predicate
    predicateVerificationResult: PredicateVerificationResult
  }): PredicateVerifiedEvent
  createExitDiscountApplyRequestedEvent(dto: {
    userEmail: string
    discountCode: string
  }): ExitDiscountApplyRequestedEvent
  createMuteEmailsSettingChangedEvent(dto: {
    username: string
    mute: boolean
    emailSubscriptionRejectionLevel: string
  }): MuteEmailsSettingChangedEvent
  createStatisticPersistenceRequestedEvent(dto: {
    statisticMeasureName: string
    value: number
    date: number
  }): StatisticPersistenceRequestedEvent
  createSessionCreatedEvent(dto: { userUuid: string }): SessionCreatedEvent
  createSessionRefreshedEvent(dto: { userUuid: string }): SessionRefreshedEvent
}
