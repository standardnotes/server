import { Uuid, RoleName, EmailMessageIdentifier } from '@standardnotes/common'
import { Predicate, PredicateVerificationResult } from '@standardnotes/predicates'
import {
  AccountDeletionRequestedEvent,
  CloudBackupRequestedEvent,
  UserRegisteredEvent,
  UserRolesChangedEvent,
  UserEmailChangedEvent,
  OfflineSubscriptionTokenCreatedEvent,
  EmailBackupRequestedEvent,
  ListedAccountRequestedEvent,
  UserSignedInEvent,
  UserDisabledSessionUserAgentLoggingEvent,
  SharedSubscriptionInvitationCreatedEvent,
  SharedSubscriptionInvitationCanceledEvent,
  PredicateVerifiedEvent,
  EmailMessageRequestedEvent,
} from '@standardnotes/domain-events'
import { InviteeIdentifierType } from '../SharedSubscription/InviteeIdentifierType'

export interface DomainEventFactoryInterface {
  createEmailMessageRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: EmailMessageIdentifier
    context: Record<string, unknown>
  }): EmailMessageRequestedEvent
  createUserSignedInEvent(dto: {
    userUuid: string
    userEmail: string
    device: string
    browser: string
    signInAlertEnabled: boolean
    muteSignInEmailsSettingUuid: Uuid
  }): UserSignedInEvent
  createListedAccountRequestedEvent(userUuid: string, userEmail: string): ListedAccountRequestedEvent
  createUserRegisteredEvent(userUuid: string, email: string): UserRegisteredEvent
  createEmailBackupRequestedEvent(
    userUuid: string,
    muteEmailsSettingUuid: string,
    userHasEmailsMuted: boolean,
  ): EmailBackupRequestedEvent
  createCloudBackupRequestedEvent(
    cloudProvider: 'DROPBOX' | 'ONE_DRIVE' | 'GOOGLE_DRIVE',
    cloudProviderToken: string,
    userUuid: string,
    muteEmailsSettingUuid: string,
    userHasEmailsMuted: boolean,
  ): CloudBackupRequestedEvent
  createAccountDeletionRequestedEvent(dto: {
    userUuid: Uuid
    regularSubscriptionUuid: Uuid | undefined
  }): AccountDeletionRequestedEvent
  createUserRolesChangedEvent(userUuid: string, email: string, currentRoles: RoleName[]): UserRolesChangedEvent
  createUserEmailChangedEvent(userUuid: string, fromEmail: string, toEmail: string): UserEmailChangedEvent
  createOfflineSubscriptionTokenCreatedEvent(token: string, email: string): OfflineSubscriptionTokenCreatedEvent
  createUserDisabledSessionUserAgentLoggingEvent(dto: {
    userUuid: Uuid
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
    inviterSubscriptionUuid: Uuid
    inviteeIdentifier: string
    inviteeIdentifierType: InviteeIdentifierType
    sharedSubscriptionInvitationUuid: Uuid
  }): SharedSubscriptionInvitationCanceledEvent
  createPredicateVerifiedEvent(dto: {
    userUuid: Uuid
    predicate: Predicate
    predicateVerificationResult: PredicateVerificationResult
  }): PredicateVerifiedEvent
}
