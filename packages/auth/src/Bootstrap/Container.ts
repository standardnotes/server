import * as winston from 'winston'
import Redis from 'ioredis'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { S3Client } from '@aws-sdk/client-s3'
import { Container } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventPublisherInterface,
  DomainEventSubscriberInterface,
} from '@standardnotes/domain-events'
import { TimerInterface, Timer } from '@standardnotes/time'
import { UAParser, UAParserInstance } from 'ua-parser-js'

import { Env } from './Env'
import TYPES from './Types'
import { AuthenticateUser } from '../Domain/UseCase/AuthenticateUser'
import { Repository } from 'typeorm'
import { AppDataSource } from './DataSource'
import { User } from '../Domain/User/User'
import { Session } from '../Domain/Session/Session'
import { SessionService } from '../Domain/Session/SessionService'
import { TypeORMSessionRepository } from '../Infra/TypeORM/TypeORMSessionRepository'
import { TypeORMUserRepository } from '../Infra/TypeORM/TypeORMUserRepository'
import { SessionProjector } from '../Projection/SessionProjector'
import { RefreshSessionToken } from '../Domain/UseCase/RefreshSessionToken'
import { KeyParamsFactory } from '../Domain/User/KeyParamsFactory'
import { SignIn } from '../Domain/UseCase/SignIn'
import { VerifyMFA } from '../Domain/UseCase/VerifyMFA'
import { UserProjector } from '../Projection/UserProjector'
import { AuthResponseFactory20161215 } from '../Domain/Auth/AuthResponseFactory20161215'
import { AuthResponseFactory20190520 } from '../Domain/Auth/AuthResponseFactory20190520'
import { AuthResponseFactory20200115 } from '../Domain/Auth/AuthResponseFactory20200115'
import { AuthResponseFactoryResolver } from '../Domain/Auth/AuthResponseFactoryResolver'
import { ClearLoginAttempts } from '../Domain/UseCase/ClearLoginAttempts'
import { IncreaseLoginAttempts } from '../Domain/UseCase/IncreaseLoginAttempts'
import { GetUserKeyParams } from '../Domain/UseCase/GetUserKeyParams/GetUserKeyParams'
import { UpdateUser } from '../Domain/UseCase/UpdateUser'
import { RedisEphemeralSessionRepository } from '../Infra/Redis/RedisEphemeralSessionRepository'
import { GetActiveSessionsForUser } from '../Domain/UseCase/GetActiveSessionsForUser'
import { DeleteOtherSessionsForUser } from '../Domain/UseCase/DeleteOtherSessionsForUser'
import { DeleteSessionForUser } from '../Domain/UseCase/DeleteSessionForUser'
import { Register } from '../Domain/UseCase/Register'
import { LockRepository } from '../Infra/Redis/LockRepository'
import { TypeORMRevokedSessionRepository } from '../Infra/TypeORM/TypeORMRevokedSessionRepository'
import { AuthenticationMethodResolver } from '../Domain/Auth/AuthenticationMethodResolver'
import { RevokedSession } from '../Domain/Session/RevokedSession'
import { DomainEventFactory } from '../Domain/Event/DomainEventFactory'
import { AuthenticateRequest } from '../Domain/UseCase/AuthenticateRequest'
import { Role } from '../Domain/Role/Role'
import { RoleProjector } from '../Projection/RoleProjector'
import { PermissionProjector } from '../Projection/PermissionProjector'
import { TypeORMRoleRepository } from '../Infra/TypeORM/TypeORMRoleRepository'
import { Setting } from '../Domain/Setting/Setting'
import { TypeORMSettingRepository } from '../Infra/TypeORM/TypeORMSettingRepository'
import { CrypterInterface } from '../Domain/Encryption/CrypterInterface'
import { CrypterNode } from '../Domain/Encryption/CrypterNode'
import { CryptoNode } from '@standardnotes/sncrypto-node'
import { GetSetting } from '../Domain/UseCase/GetSetting/GetSetting'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { SubscriptionPurchasedEventHandler } from '../Domain/Handler/SubscriptionPurchasedEventHandler'
import { SubscriptionRenewedEventHandler } from '../Domain/Handler/SubscriptionRenewedEventHandler'
import { SubscriptionRefundedEventHandler } from '../Domain/Handler/SubscriptionRefundedEventHandler'
import { SubscriptionExpiredEventHandler } from '../Domain/Handler/SubscriptionExpiredEventHandler'
import { DeleteAccount } from '../Domain/UseCase/DeleteAccount/DeleteAccount'
import { DeleteSetting } from '../Domain/UseCase/DeleteSetting/DeleteSetting'
import { UserSubscription } from '../Domain/Subscription/UserSubscription'
import { TypeORMUserSubscriptionRepository } from '../Infra/TypeORM/TypeORMUserSubscriptionRepository'
import { WebSocketsClientService } from '../Infra/WebSockets/WebSocketsClientService'
import { RoleService } from '../Domain/Role/RoleService'
import { ClientServiceInterface } from '../Domain/Client/ClientServiceInterface'
import { RoleServiceInterface } from '../Domain/Role/RoleServiceInterface'
import { GetUserFeatures } from '../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { RoleToSubscriptionMapInterface } from '../Domain/Role/RoleToSubscriptionMapInterface'
import { RoleToSubscriptionMap } from '../Domain/Role/RoleToSubscriptionMap'
import { FeatureServiceInterface } from '../Domain/Feature/FeatureServiceInterface'
import { FeatureService } from '../Domain/Feature/FeatureService'
import { ExtensionKeyGrantedEventHandler } from '../Domain/Handler/ExtensionKeyGrantedEventHandler'
import {
  DirectCallDomainEventPublisher,
  DirectCallEventMessageHandler,
  SNSDomainEventPublisher,
  SQSDomainEventSubscriber,
  SQSEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { GetUserSubscription } from '../Domain/UseCase/GetUserSubscription/GetUserSubscription'
import { ChangeCredentials } from '../Domain/UseCase/ChangeCredentials/ChangeCredentials'
import { SubscriptionReassignedEventHandler } from '../Domain/Handler/SubscriptionReassignedEventHandler'
import { UserSubscriptionRepositoryInterface } from '../Domain/Subscription/UserSubscriptionRepositoryInterface'
import { CreateSubscriptionToken } from '../Domain/UseCase/CreateSubscriptionToken/CreateSubscriptionToken'
import { SubscriptionTokenRepositoryInterface } from '../Domain/Subscription/SubscriptionTokenRepositoryInterface'
import { RedisSubscriptionTokenRepository } from '../Infra/Redis/RedisSubscriptionTokenRepository'
import { AuthenticateSubscriptionToken } from '../Domain/UseCase/AuthenticateSubscriptionToken/AuthenticateSubscriptionToken'
import { OfflineSetting } from '../Domain/Setting/OfflineSetting'
import { OfflineSettingServiceInterface } from '../Domain/Setting/OfflineSettingServiceInterface'
import { OfflineSettingService } from '../Domain/Setting/OfflineSettingService'
import { OfflineSettingRepositoryInterface } from '../Domain/Setting/OfflineSettingRepositoryInterface'
import { SettingRepositoryInterface } from '../Domain/Setting/SettingRepositoryInterface'
import { TypeORMOfflineSettingRepository } from '../Infra/TypeORM/TypeORMOfflineSettingRepository'
import { OfflineUserSubscription } from '../Domain/Subscription/OfflineUserSubscription'
import { OfflineUserSubscriptionRepositoryInterface } from '../Domain/Subscription/OfflineUserSubscriptionRepositoryInterface'
import { TypeORMOfflineUserSubscriptionRepository } from '../Infra/TypeORM/TypeORMOfflineUserSubscriptionRepository'
import { OfflineSubscriptionTokenRepositoryInterface } from '../Domain/Auth/OfflineSubscriptionTokenRepositoryInterface'
import { RedisOfflineSubscriptionTokenRepository } from '../Infra/Redis/RedisOfflineSubscriptionTokenRepository'
import { CreateOfflineSubscriptionToken } from '../Domain/UseCase/CreateOfflineSubscriptionToken/CreateOfflineSubscriptionToken'
import { AuthenticateOfflineSubscriptionToken } from '../Domain/UseCase/AuthenticateOfflineSubscriptionToken/AuthenticateOfflineSubscriptionToken'
import { SubscriptionCancelledEventHandler } from '../Domain/Handler/SubscriptionCancelledEventHandler'
import { ContentDecoder, ContentDecoderInterface, ProtocolVersion } from '@standardnotes/common'
import { GetUserOfflineSubscription } from '../Domain/UseCase/GetUserOfflineSubscription/GetUserOfflineSubscription'
import { SettingsAssociationServiceInterface } from '../Domain/Setting/SettingsAssociationServiceInterface'
import { SettingsAssociationService } from '../Domain/Setting/SettingsAssociationService'
import { SubscriptionSyncRequestedEventHandler } from '../Domain/Handler/SubscriptionSyncRequestedEventHandler'
import {
  CrossServiceTokenData,
  DeterministicSelector,
  OfflineUserTokenData,
  SelectorInterface,
  SessionTokenData,
  TokenDecoder,
  TokenDecoderInterface,
  TokenEncoder,
  TokenEncoderInterface,
  ValetTokenData,
  WebSocketConnectionTokenData,
} from '@standardnotes/security'
import { FileUploadedEventHandler } from '../Domain/Handler/FileUploadedEventHandler'
import { CreateValetToken } from '../Domain/UseCase/CreateValetToken/CreateValetToken'
import { CreateListedAccount } from '../Domain/UseCase/CreateListedAccount/CreateListedAccount'
import { ListedAccountCreatedEventHandler } from '../Domain/Handler/ListedAccountCreatedEventHandler'
import { ListedAccountDeletedEventHandler } from '../Domain/Handler/ListedAccountDeletedEventHandler'
import { FileRemovedEventHandler } from '../Domain/Handler/FileRemovedEventHandler'
import { UserDisabledSessionUserAgentLoggingEventHandler } from '../Domain/Handler/UserDisabledSessionUserAgentLoggingEventHandler'
import { SettingCrypterInterface } from '../Domain/Setting/SettingCrypterInterface'
import { SettingCrypter } from '../Domain/Setting/SettingCrypter'
import { SharedSubscriptionInvitationRepositoryInterface } from '../Domain/SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'
import { TypeORMSharedSubscriptionInvitationRepository } from '../Infra/TypeORM/TypeORMSharedSubscriptionInvitationRepository'
import { InviteToSharedSubscription } from '../Domain/UseCase/InviteToSharedSubscription/InviteToSharedSubscription'
import { SharedSubscriptionInvitation } from '../Domain/SharedSubscription/SharedSubscriptionInvitation'
import { AcceptSharedSubscriptionInvitation } from '../Domain/UseCase/AcceptSharedSubscriptionInvitation/AcceptSharedSubscriptionInvitation'
import { DeclineSharedSubscriptionInvitation } from '../Domain/UseCase/DeclineSharedSubscriptionInvitation/DeclineSharedSubscriptionInvitation'
import { CancelSharedSubscriptionInvitation } from '../Domain/UseCase/CancelSharedSubscriptionInvitation/CancelSharedSubscriptionInvitation'
import { SharedSubscriptionInvitationCreatedEventHandler } from '../Domain/Handler/SharedSubscriptionInvitationCreatedEventHandler'
import { SubscriptionSettingRepositoryInterface } from '../Domain/Setting/SubscriptionSettingRepositoryInterface'
import { TypeORMSubscriptionSettingRepository } from '../Infra/TypeORM/TypeORMSubscriptionSettingRepository'
import { ListSharedSubscriptionInvitations } from '../Domain/UseCase/ListSharedSubscriptionInvitations/ListSharedSubscriptionInvitations'
import { SubscriptionSettingsAssociationService } from '../Domain/Setting/SubscriptionSettingsAssociationService'
import { SubscriptionSettingsAssociationServiceInterface } from '../Domain/Setting/SubscriptionSettingsAssociationServiceInterface'
import { PKCERepositoryInterface } from '../Domain/User/PKCERepositoryInterface'
import { LockRepositoryInterface } from '../Domain/User/LockRepositoryInterface'
import { RedisPKCERepository } from '../Infra/Redis/RedisPKCERepository'
import { RoleRepositoryInterface } from '../Domain/Role/RoleRepositoryInterface'
import { RevokedSessionRepositoryInterface } from '../Domain/Session/RevokedSessionRepositoryInterface'
import { SessionRepositoryInterface } from '../Domain/Session/SessionRepositoryInterface'
import { UserRepositoryInterface } from '../Domain/User/UserRepositoryInterface'
import { AuthController } from '../Controller/AuthController'
import { VerifyPredicate } from '../Domain/UseCase/VerifyPredicate/VerifyPredicate'
import { PredicateVerificationRequestedEventHandler } from '../Domain/Handler/PredicateVerificationRequestedEventHandler'
import { SubscriptionInvitesController } from '../Controller/SubscriptionInvitesController'
import { CreateCrossServiceToken } from '../Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { ProcessUserRequest } from '../Domain/UseCase/ProcessUserRequest/ProcessUserRequest'
import { UserRequestsController } from '../Controller/UserRequestsController'
import { EmailSubscriptionUnsubscribedEventHandler } from '../Domain/Handler/EmailSubscriptionUnsubscribedEventHandler'
import { SessionTraceRepositoryInterface } from '../Domain/Session/SessionTraceRepositoryInterface'
import { TypeORMSessionTraceRepository } from '../Infra/TypeORM/TypeORMSessionTraceRepository'
import {
  CacheEntry,
  CacheEntryRepositoryInterface,
  ControllerContainer,
  ControllerContainerInterface,
  MapperInterface,
  SharedVaultUser,
} from '@standardnotes/domain-core'
import { SessionTracePersistenceMapper } from '../Mapping/SessionTracePersistenceMapper'
import { SessionTrace } from '../Domain/Session/SessionTrace'
import { TypeORMSessionTrace } from '../Infra/TypeORM/TypeORMSessionTrace'
import { TraceSession } from '../Domain/UseCase/TraceSession/TraceSession'
import { CleanupSessionTraces } from '../Domain/UseCase/CleanupSessionTraces/CleanupSessionTraces'
import { PersistStatistics } from '../Domain/UseCase/PersistStatistics/PersistStatistics'
import { TypeORMAuthenticator } from '../Infra/TypeORM/TypeORMAuthenticator'
import { Authenticator } from '../Domain/Authenticator/Authenticator'
import { AuthenticatorPersistenceMapper } from '../Mapping/AuthenticatorPersistenceMapper'
import { AuthenticatorChallenge } from '../Domain/Authenticator/AuthenticatorChallenge'
import { TypeORMAuthenticatorChallenge } from '../Infra/TypeORM/TypeORMAuthenticatorChallenge'
import { AuthenticatorChallengePersistenceMapper } from '../Mapping/AuthenticatorChallengePersistenceMapper'
import { AuthenticatorRepositoryInterface } from '../Domain/Authenticator/AuthenticatorRepositoryInterface'
import { TypeORMAuthenticatorRepository } from '../Infra/TypeORM/TypeORMAuthenticatorRepository'
import { AuthenticatorChallengeRepositoryInterface } from '../Domain/Authenticator/AuthenticatorChallengeRepositoryInterface'
import { TypeORMAuthenticatorChallengeRepository } from '../Infra/TypeORM/TypeORMAuthenticatorChallengeRepository'
import { GenerateAuthenticatorRegistrationOptions } from '../Domain/UseCase/GenerateAuthenticatorRegistrationOptions/GenerateAuthenticatorRegistrationOptions'
import { VerifyAuthenticatorRegistrationResponse } from '../Domain/UseCase/VerifyAuthenticatorRegistrationResponse/VerifyAuthenticatorRegistrationResponse'
import { GenerateAuthenticatorAuthenticationOptions } from '../Domain/UseCase/GenerateAuthenticatorAuthenticationOptions/GenerateAuthenticatorAuthenticationOptions'
import { VerifyAuthenticatorAuthenticationResponse } from '../Domain/UseCase/VerifyAuthenticatorAuthenticationResponse/VerifyAuthenticatorAuthenticationResponse'
import { AuthenticatorsController } from '../Controller/AuthenticatorsController'
import { ListAuthenticators } from '../Domain/UseCase/ListAuthenticators/ListAuthenticators'
import { AuthenticatorHttpProjection } from '../Infra/Http/Projection/AuthenticatorHttpProjection'
import { AuthenticatorHttpMapper } from '../Mapping/AuthenticatorHttpMapper'
import { DeleteAuthenticator } from '../Domain/UseCase/DeleteAuthenticator/DeleteAuthenticator'
import { GenerateRecoveryCodes } from '../Domain/UseCase/GenerateRecoveryCodes/GenerateRecoveryCodes'
import { SignInWithRecoveryCodes } from '../Domain/UseCase/SignInWithRecoveryCodes/SignInWithRecoveryCodes'
import { GetUserKeyParamsRecovery } from '../Domain/UseCase/GetUserKeyParamsRecovery/GetUserKeyParamsRecovery'
import { CleanupExpiredSessions } from '../Domain/UseCase/CleanupExpiredSessions/CleanupExpiredSessions'
import { TypeORMCacheEntry } from '../Infra/TypeORM/TypeORMCacheEntry'
import { TypeORMCacheEntryRepository } from '../Infra/TypeORM/TypeORMCacheEntryRepository'
import { CacheEntryPersistenceMapper } from '../Mapping/CacheEntryPersistenceMapper'
import { TypeORMLockRepository } from '../Infra/TypeORM/TypeORMLockRepository'
import { EphemeralSessionRepositoryInterface } from '../Domain/Session/EphemeralSessionRepositoryInterface'
import { TypeORMEphemeralSessionRepository } from '../Infra/TypeORM/TypeORMEphemeralSessionRepository'
import { TypeORMOfflineSubscriptionTokenRepository } from '../Infra/TypeORM/TypeORMOfflineSubscriptionTokenRepository'
import { TypeORMPKCERepository } from '../Infra/TypeORM/TypeORMPKCERepository'
import { TypeORMSubscriptionTokenRepository } from '../Infra/TypeORM/TypeORMSubscriptionTokenRepository'
import { SessionMiddleware } from '../Infra/InversifyExpressUtils/Middleware/SessionMiddleware'
import { ApiGatewayOfflineAuthMiddleware } from '../Infra/InversifyExpressUtils/Middleware/ApiGatewayOfflineAuthMiddleware'
import { OfflineUserAuthMiddleware } from '../Infra/InversifyExpressUtils/Middleware/OfflineUserAuthMiddleware'
import { LockMiddleware } from '../Infra/InversifyExpressUtils/Middleware/LockMiddleware'
import { RequiredCrossServiceTokenMiddleware } from '../Infra/InversifyExpressUtils/Middleware/RequiredCrossServiceTokenMiddleware'
import { OptionalCrossServiceTokenMiddleware } from '../Infra/InversifyExpressUtils/Middleware/OptionalCrossServiceTokenMiddleware'
import { BaseSettingsController } from '../Infra/InversifyExpressUtils/Base/BaseSettingsController'
import { BaseAdminController } from '../Infra/InversifyExpressUtils/Base/BaseAdminController'
import { BaseAuthController } from '../Infra/InversifyExpressUtils/Base/BaseAuthController'
import { BaseAuthenticatorsController } from '../Infra/InversifyExpressUtils/Base/BaseAuthenticatorsController'
import { BaseFeaturesController } from '../Infra/InversifyExpressUtils/Base/BaseFeaturesController'
import { BaseListedController } from '../Infra/InversifyExpressUtils/Base/BaseListedController'
import { BaseOfflineController } from '../Infra/InversifyExpressUtils/Base/BaseOfflineController'
import { BaseSessionController } from '../Infra/InversifyExpressUtils/Base/BaseSessionController'
import { BaseSubscriptionInvitesController } from '../Infra/InversifyExpressUtils/Base/BaseSubscriptionInvitesController'
import { BaseSubscriptionSettingsController } from '../Infra/InversifyExpressUtils/Base/BaseSubscriptionSettingsController'
import { BaseSubscriptionTokensController } from '../Infra/InversifyExpressUtils/Base/BaseSubscriptionTokensController'
import { BaseUserRequestsController } from '../Infra/InversifyExpressUtils/Base/BaseUserRequestsController'
import { BaseUsersController } from '../Infra/InversifyExpressUtils/Base/BaseUsersController'
import { BaseValetTokenController } from '../Infra/InversifyExpressUtils/Base/BaseValetTokenController'
import { BaseWebSocketsController } from '../Infra/InversifyExpressUtils/Base/BaseWebSocketsController'
import { BaseSessionsController } from '../Infra/InversifyExpressUtils/Base/BaseSessionsController'
import { Transform } from 'stream'
import { ActivatePremiumFeatures } from '../Domain/UseCase/ActivatePremiumFeatures/ActivatePremiumFeatures'
import { PaymentsAccountDeletedEventHandler } from '../Domain/Handler/PaymentsAccountDeletedEventHandler'
import { UpdateStorageQuotaUsedForUser } from '../Domain/UseCase/UpdateStorageQuotaUsedForUser/UpdateStorageQuotaUsedForUser'
import { SharedVaultFileUploadedEventHandler } from '../Domain/Handler/SharedVaultFileUploadedEventHandler'
import { SharedVaultFileRemovedEventHandler } from '../Domain/Handler/SharedVaultFileRemovedEventHandler'
import { SharedVaultFileMovedEventHandler } from '../Domain/Handler/SharedVaultFileMovedEventHandler'
import { TypeORMSharedVaultUser } from '../Infra/TypeORM/TypeORMSharedVaultUser'
import { SharedVaultUserPersistenceMapper } from '../Mapping/SharedVaultUserPersistenceMapper'
import { SharedVaultUserRepositoryInterface } from '../Domain/SharedVault/SharedVaultUserRepositoryInterface'
import { TypeORMSharedVaultUserRepository } from '../Infra/TypeORM/TypeORMSharedVaultUserRepository'
import { AddSharedVaultUser } from '../Domain/UseCase/AddSharedVaultUser/AddSharedVaultUser'
import { RemoveSharedVaultUser } from '../Domain/UseCase/RemoveSharedVaultUser/RemoveSharedVaultUser'
import { UserAddedToSharedVaultEventHandler } from '../Domain/Handler/UserAddedToSharedVaultEventHandler'
import { UserRemovedFromSharedVaultEventHandler } from '../Domain/Handler/UserRemovedFromSharedVaultEventHandler'
import { DesignateSurvivor } from '../Domain/UseCase/DesignateSurvivor/DesignateSurvivor'
import { UserDesignatedAsSurvivorInSharedVaultEventHandler } from '../Domain/Handler/UserDesignatedAsSurvivorInSharedVaultEventHandler'
import { DisableEmailSettingBasedOnEmailSubscription } from '../Domain/UseCase/DisableEmailSettingBasedOnEmailSubscription/DisableEmailSettingBasedOnEmailSubscription'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { KeyParamsFactoryInterface } from '../Domain/User/KeyParamsFactoryInterface'
import { TypeORMSubscriptionSetting } from '../Infra/TypeORM/TypeORMSubscriptionSetting'
import { SetSettingValue } from '../Domain/UseCase/SetSettingValue/SetSettingValue'
import { ApplyDefaultSubscriptionSettings } from '../Domain/UseCase/ApplyDefaultSubscriptionSettings/ApplyDefaultSubscriptionSettings'
import { GetSubscriptionSetting } from '../Domain/UseCase/GetSubscriptionSetting/GetSubscriptionSetting'
import { SetSubscriptionSettingValue } from '../Domain/UseCase/SetSubscriptionSettingValue/SetSubscriptionSettingValue'
import { GetSettings } from '../Domain/UseCase/GetSettings/GetSettings'
import { GetSubscriptionSettings } from '../Domain/UseCase/GetSubscriptionSettings/GetSubscriptionSettings'
import { GetAllSettingsForUser } from '../Domain/UseCase/GetAllSettingsForUser/GetAllSettingsForUser'
import { GetRegularSubscriptionForUser } from '../Domain/UseCase/GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { GetSharedSubscriptionForUser } from '../Domain/UseCase/GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { GetSharedOrRegularSubscriptionForUser } from '../Domain/UseCase/GetSharedOrRegularSubscriptionForUser/GetSharedOrRegularSubscriptionForUser'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { SettingHttpRepresentation } from '../Mapping/Http/SettingHttpRepresentation'
import { SubscriptionSetting } from '../Domain/Setting/SubscriptionSetting'
import { SubscriptionSettingHttpRepresentation } from '../Mapping/Http/SubscriptionSettingHttpRepresentation'
import { SettingHttpMapper } from '../Mapping/Http/SettingHttpMapper'
import { SubscriptionSettingHttpMapper } from '../Mapping/Http/SubscriptionSettingHttpMapper'
import { TypeORMSetting } from '../Infra/TypeORM/TypeORMSetting'
import { SettingPersistenceMapper } from '../Mapping/Persistence/SettingPersistenceMapper'
import { SubscriptionSettingPersistenceMapper } from '../Mapping/Persistence/SubscriptionSettingPersistenceMapper'
import { ApplyDefaultSettings } from '../Domain/UseCase/ApplyDefaultSettings/ApplyDefaultSettings'
import { AuthResponseFactoryResolverInterface } from '../Domain/Auth/AuthResponseFactoryResolverInterface'
import { UserInvitedToSharedVaultEventHandler } from '../Domain/Handler/UserInvitedToSharedVaultEventHandler'
import { TriggerPostSettingUpdateActions } from '../Domain/UseCase/TriggerPostSettingUpdateActions/TriggerPostSettingUpdateActions'
import { TriggerEmailBackupForUser } from '../Domain/UseCase/TriggerEmailBackupForUser/TriggerEmailBackupForUser'
import { TriggerEmailBackupForAllUsers } from '../Domain/UseCase/TriggerEmailBackupForAllUsers/TriggerEmailBackupForAllUsers'
import { CSVFileReaderInterface } from '../Domain/CSV/CSVFileReaderInterface'
import { S3CsvFileReader } from '../Infra/S3/S3CsvFileReader'
import { DeleteAccountsFromCSVFile } from '../Domain/UseCase/DeleteAccountsFromCSVFile/DeleteAccountsFromCSVFile'
import { AccountDeletionVerificationPassedEventHandler } from '../Domain/Handler/AccountDeletionVerificationPassedEventHandler'
import { RenewSharedSubscriptions } from '../Domain/UseCase/RenewSharedSubscriptions/RenewSharedSubscriptions'
import { FixStorageQuotaForUser } from '../Domain/UseCase/FixStorageQuotaForUser/FixStorageQuotaForUser'
import { FileQuotaRecalculatedEventHandler } from '../Domain/Handler/FileQuotaRecalculatedEventHandler'
import { SessionServiceInterface } from '../Domain/Session/SessionServiceInterface'
import { SubscriptionStateFetchedEventHandler } from '../Domain/Handler/SubscriptionStateFetchedEventHandler'

export class ContainerConfigLoader {
  constructor(private mode: 'server' | 'worker' = 'server') {}

  async load(configuration?: {
    controllerConatiner?: ControllerContainerInterface
    directCallDomainEventPublisher?: DirectCallDomainEventPublisher
    logger?: Transform
    environmentOverrides?: { [name: string]: string }
  }): Promise<Container> {
    const directCallDomainEventPublisher =
      configuration?.directCallDomainEventPublisher ?? new DirectCallDomainEventPublisher()

    const env: Env = new Env(configuration?.environmentOverrides)
    env.load()

    const container = new Container()

    const winstonFormatters = [winston.format.splat(), winston.format.json()]

    let logger: winston.Logger
    if (configuration?.logger) {
      logger = configuration.logger as winston.Logger
    } else {
      logger = winston.createLogger({
        level: env.get('LOG_LEVEL', true) || 'info',
        format: winston.format.combine(...winstonFormatters),
        transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL', true) || 'info' })],
        defaultMeta: { service: `auth:${this.mode}` },
      })
    }
    container.bind<winston.Logger>(TYPES.Auth_Logger).toConstantValue(logger)

    container.bind<CryptoNode>(TYPES.Auth_CryptoNode).toConstantValue(new CryptoNode())

    const appDataSource = new AppDataSource({ env, runMigrations: this.mode === 'server' })
    await appDataSource.initialize()

    logger.debug('Database initialized')

    const isConfiguredForHomeServer = env.get('MODE', true) === 'home-server'
    const isConfiguredForSelfHosting = env.get('MODE', true) === 'self-hosted'
    const isConfiguredForHomeServerOrSelfHosting = isConfiguredForHomeServer || isConfiguredForSelfHosting
    const isConfiguredForInMemoryCache = env.get('CACHE_TYPE', true) === 'memory'

    container
      .bind<boolean>(TYPES.Auth_IS_CONFIGURED_FOR_HOME_SERVER_OR_SELF_HOSTING)
      .toConstantValue(isConfiguredForHomeServerOrSelfHosting)

    if (!isConfiguredForInMemoryCache) {
      const redisUrl = env.get('REDIS_URL')
      const isRedisInClusterMode = redisUrl.indexOf(',') > 0
      let redis
      if (isRedisInClusterMode) {
        redis = new Redis.Cluster(redisUrl.split(','))
      } else {
        redis = new Redis(redisUrl)
      }

      container.bind(TYPES.Auth_Redis).toConstantValue(redis)
    }

    container.bind<TimerInterface>(TYPES.Auth_Timer).toConstantValue(new Timer())

    if (!isConfiguredForHomeServer) {
      const snsConfig: SNSClientConfig = {
        region: env.get('SNS_AWS_REGION', true),
      }
      if (env.get('SNS_ENDPOINT', true)) {
        snsConfig.endpoint = env.get('SNS_ENDPOINT', true)
      }
      if (env.get('SNS_ACCESS_KEY_ID', true) && env.get('SNS_SECRET_ACCESS_KEY', true)) {
        snsConfig.credentials = {
          accessKeyId: env.get('SNS_ACCESS_KEY_ID', true),
          secretAccessKey: env.get('SNS_SECRET_ACCESS_KEY', true),
        }
      }
      const snsClient = new SNSClient(snsConfig)
      container.bind<SNSClient>(TYPES.Auth_SNS).toConstantValue(snsClient)

      const sqsConfig: SQSClientConfig = {
        region: env.get('SQS_AWS_REGION', true),
      }
      if (env.get('SQS_ENDPOINT', true)) {
        sqsConfig.endpoint = env.get('SQS_ENDPOINT', true)
      }
      if (env.get('SQS_ACCESS_KEY_ID', true) && env.get('SQS_SECRET_ACCESS_KEY', true)) {
        sqsConfig.credentials = {
          accessKeyId: env.get('SQS_ACCESS_KEY_ID', true),
          secretAccessKey: env.get('SQS_SECRET_ACCESS_KEY', true),
        }
      }
      const sqsClient = new SQSClient(sqsConfig)
      container.bind<SQSClient>(TYPES.Auth_SQS).toConstantValue(sqsClient)

      container.bind<S3Client>(TYPES.Auth_S3).toConstantValue(
        new S3Client({
          apiVersion: 'latest',
          region: env.get('S3_AWS_REGION', true),
        }),
      )

      container
        .bind<CSVFileReaderInterface>(TYPES.Auth_CSVFileReader)
        .toConstantValue(
          new S3CsvFileReader(env.get('S3_AUTH_SCRIPTS_DATA_BUCKET', true), container.get<S3Client>(TYPES.Auth_S3)),
        )
    }

    container.bind(TYPES.Auth_SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN', true))

    container
      .bind<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher)
      .toConstantValue(
        isConfiguredForHomeServer
          ? directCallDomainEventPublisher
          : new SNSDomainEventPublisher(container.get(TYPES.Auth_SNS), container.get(TYPES.Auth_SNS_TOPIC_ARN)),
      )

    // Mapping
    container
      .bind<MapperInterface<SessionTrace, TypeORMSessionTrace>>(TYPES.Auth_SessionTracePersistenceMapper)
      .toConstantValue(new SessionTracePersistenceMapper(container.get<TimerInterface>(TYPES.Auth_Timer)))
    container
      .bind<MapperInterface<Authenticator, TypeORMAuthenticator>>(TYPES.Auth_AuthenticatorPersistenceMapper)
      .toConstantValue(new AuthenticatorPersistenceMapper())
    container
      .bind<MapperInterface<Authenticator, AuthenticatorHttpProjection>>(TYPES.Auth_AuthenticatorHttpMapper)
      .toConstantValue(new AuthenticatorHttpMapper())
    container
      .bind<MapperInterface<AuthenticatorChallenge, TypeORMAuthenticatorChallenge>>(
        TYPES.Auth_AuthenticatorChallengePersistenceMapper,
      )
      .toConstantValue(new AuthenticatorChallengePersistenceMapper())
    container
      .bind<MapperInterface<CacheEntry, TypeORMCacheEntry>>(TYPES.Auth_CacheEntryPersistenceMapper)
      .toConstantValue(new CacheEntryPersistenceMapper())
    container
      .bind<MapperInterface<SharedVaultUser, TypeORMSharedVaultUser>>(TYPES.Auth_SharedVaultUserPersistenceMapper)
      .toConstantValue(new SharedVaultUserPersistenceMapper())
    container
      .bind<MapperInterface<Setting, SettingHttpRepresentation>>(TYPES.Auth_SettingHttpMapper)
      .toConstantValue(new SettingHttpMapper())
    container
      .bind<MapperInterface<SubscriptionSetting, SubscriptionSettingHttpRepresentation>>(
        TYPES.Auth_SubscriptionSettingHttpMapper,
      )
      .toConstantValue(new SubscriptionSettingHttpMapper())
    container
      .bind<MapperInterface<Setting, TypeORMSetting>>(TYPES.Auth_SettingPersistenceMapper)
      .toConstantValue(new SettingPersistenceMapper())
    container
      .bind<MapperInterface<SubscriptionSetting, TypeORMSubscriptionSetting>>(
        TYPES.Auth_SubscriptionSettingPersistenceMapper,
      )
      .toConstantValue(new SubscriptionSettingPersistenceMapper())

    // ORM
    container
      .bind<Repository<OfflineSetting>>(TYPES.Auth_ORMOfflineSettingRepository)
      .toConstantValue(appDataSource.getRepository(OfflineSetting))
    container
      .bind<Repository<OfflineUserSubscription>>(TYPES.Auth_ORMOfflineUserSubscriptionRepository)
      .toConstantValue(appDataSource.getRepository(OfflineUserSubscription))
    container
      .bind<Repository<RevokedSession>>(TYPES.Auth_ORMRevokedSessionRepository)
      .toConstantValue(appDataSource.getRepository(RevokedSession))
    container.bind<Repository<Role>>(TYPES.Auth_ORMRoleRepository).toConstantValue(appDataSource.getRepository(Role))
    container
      .bind<Repository<Session>>(TYPES.Auth_ORMSessionRepository)
      .toConstantValue(appDataSource.getRepository(Session))
    container
      .bind<Repository<TypeORMSetting>>(TYPES.Auth_ORMSettingRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMSetting))
    container
      .bind<Repository<SharedSubscriptionInvitation>>(TYPES.Auth_ORMSharedSubscriptionInvitationRepository)
      .toConstantValue(appDataSource.getRepository(SharedSubscriptionInvitation))
    container
      .bind<Repository<TypeORMSubscriptionSetting>>(TYPES.Auth_ORMSubscriptionSettingRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMSubscriptionSetting))
    container.bind<Repository<User>>(TYPES.Auth_ORMUserRepository).toConstantValue(appDataSource.getRepository(User))
    container
      .bind<Repository<UserSubscription>>(TYPES.Auth_ORMUserSubscriptionRepository)
      .toConstantValue(appDataSource.getRepository(UserSubscription))
    container
      .bind<Repository<TypeORMSessionTrace>>(TYPES.Auth_ORMSessionTraceRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMSessionTrace))
    container
      .bind<Repository<TypeORMAuthenticator>>(TYPES.Auth_ORMAuthenticatorRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMAuthenticator))
    container
      .bind<Repository<TypeORMAuthenticatorChallenge>>(TYPES.Auth_ORMAuthenticatorChallengeRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMAuthenticatorChallenge))
    container
      .bind<Repository<TypeORMCacheEntry>>(TYPES.Auth_ORMCacheEntryRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMCacheEntry))
    container
      .bind<Repository<TypeORMSharedVaultUser>>(TYPES.Auth_ORMSharedVaultUserRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMSharedVaultUser))

    // Repositories
    container.bind<SessionRepositoryInterface>(TYPES.Auth_SessionRepository).to(TypeORMSessionRepository)
    container
      .bind<RevokedSessionRepositoryInterface>(TYPES.Auth_RevokedSessionRepository)
      .to(TypeORMRevokedSessionRepository)
    container.bind<UserRepositoryInterface>(TYPES.Auth_UserRepository).to(TypeORMUserRepository)
    container
      .bind<SettingRepositoryInterface>(TYPES.Auth_SettingRepository)
      .toConstantValue(
        new TypeORMSettingRepository(
          container.get<Repository<TypeORMSetting>>(TYPES.Auth_ORMSettingRepository),
          container.get<MapperInterface<Setting, TypeORMSetting>>(TYPES.Auth_SettingPersistenceMapper),
        ),
      )
    container
      .bind<SubscriptionSettingRepositoryInterface>(TYPES.Auth_SubscriptionSettingRepository)
      .toConstantValue(
        new TypeORMSubscriptionSettingRepository(
          container.get<Repository<TypeORMSubscriptionSetting>>(TYPES.Auth_ORMSubscriptionSettingRepository),
          container.get<MapperInterface<SubscriptionSetting, TypeORMSubscriptionSetting>>(
            TYPES.Auth_SubscriptionSettingPersistenceMapper,
          ),
        ),
      )
    container
      .bind<OfflineSettingRepositoryInterface>(TYPES.Auth_OfflineSettingRepository)
      .to(TypeORMOfflineSettingRepository)
    container.bind<RoleRepositoryInterface>(TYPES.Auth_RoleRepository).to(TypeORMRoleRepository)
    container
      .bind<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository)
      .to(TypeORMUserSubscriptionRepository)
    container
      .bind<OfflineUserSubscriptionRepositoryInterface>(TYPES.Auth_OfflineUserSubscriptionRepository)
      .to(TypeORMOfflineUserSubscriptionRepository)
    container
      .bind<SharedSubscriptionInvitationRepositoryInterface>(TYPES.Auth_SharedSubscriptionInvitationRepository)
      .to(TypeORMSharedSubscriptionInvitationRepository)
    container
      .bind<SessionTraceRepositoryInterface>(TYPES.Auth_SessionTraceRepository)
      .toConstantValue(
        new TypeORMSessionTraceRepository(
          container.get<Repository<TypeORMSessionTrace>>(TYPES.Auth_ORMSessionTraceRepository),
          container.get<MapperInterface<SessionTrace, TypeORMSessionTrace>>(TYPES.Auth_SessionTracePersistenceMapper),
          container.get<TimerInterface>(TYPES.Auth_Timer),
        ),
      )
    container
      .bind<AuthenticatorRepositoryInterface>(TYPES.Auth_AuthenticatorRepository)
      .toConstantValue(
        new TypeORMAuthenticatorRepository(
          container.get(TYPES.Auth_ORMAuthenticatorRepository),
          container.get(TYPES.Auth_AuthenticatorPersistenceMapper),
        ),
      )
    container
      .bind<AuthenticatorChallengeRepositoryInterface>(TYPES.Auth_AuthenticatorChallengeRepository)
      .toConstantValue(
        new TypeORMAuthenticatorChallengeRepository(
          container.get(TYPES.Auth_ORMAuthenticatorChallengeRepository),
          container.get(TYPES.Auth_AuthenticatorChallengePersistenceMapper),
        ),
      )
    container
      .bind<CacheEntryRepositoryInterface>(TYPES.Auth_CacheEntryRepository)
      .toConstantValue(
        new TypeORMCacheEntryRepository(
          container.get(TYPES.Auth_ORMCacheEntryRepository),
          container.get(TYPES.Auth_CacheEntryPersistenceMapper),
        ),
      )
    container
      .bind<SharedVaultUserRepositoryInterface>(TYPES.Auth_SharedVaultUserRepository)
      .toConstantValue(
        new TypeORMSharedVaultUserRepository(
          container.get<Repository<TypeORMSharedVaultUser>>(TYPES.Auth_ORMSharedVaultUserRepository),
          container.get<MapperInterface<SharedVaultUser, TypeORMSharedVaultUser>>(
            TYPES.Auth_SharedVaultUserPersistenceMapper,
          ),
        ),
      )

    // Projectors
    container.bind<SessionProjector>(TYPES.Auth_SessionProjector).to(SessionProjector)
    container.bind<UserProjector>(TYPES.Auth_UserProjector).to(UserProjector)
    container.bind<RoleProjector>(TYPES.Auth_RoleProjector).to(RoleProjector)
    container.bind<PermissionProjector>(TYPES.Auth_PermissionProjector).to(PermissionProjector)

    // env vars
    container.bind(TYPES.Auth_JWT_SECRET).toConstantValue(env.get('JWT_SECRET'))
    container.bind(TYPES.Auth_LEGACY_JWT_SECRET).toConstantValue(env.get('LEGACY_JWT_SECRET', true))
    container.bind(TYPES.Auth_AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container
      .bind(TYPES.Auth_AUTH_JWT_TTL)
      .toConstantValue(env.get('AUTH_JWT_TTL', true) ? +env.get('AUTH_JWT_TTL') : 60_000)
    container.bind(TYPES.Auth_VALET_TOKEN_SECRET).toConstantValue(env.get('VALET_TOKEN_SECRET', true))
    container
      .bind(TYPES.Auth_VALET_TOKEN_TTL)
      .toConstantValue(env.get('VALET_TOKEN_TTL', true) ? +env.get('VALET_TOKEN_TTL', true) : 7200)
    container
      .bind(TYPES.Auth_WEB_SOCKET_CONNECTION_TOKEN_SECRET)
      .toConstantValue(env.get('WEB_SOCKET_CONNECTION_TOKEN_SECRET', true))
    container.bind(TYPES.Auth_ENCRYPTION_SERVER_KEY).toConstantValue(env.get('ENCRYPTION_SERVER_KEY'))
    container
      .bind(TYPES.Auth_ACCESS_TOKEN_AGE)
      .toConstantValue(env.get('ACCESS_TOKEN_AGE', true) ? +env.get('ACCESS_TOKEN_AGE', true) : 5184000)
    container
      .bind(TYPES.Auth_REFRESH_TOKEN_AGE)
      .toConstantValue(env.get('REFRESH_TOKEN_AGE', true) ? +env.get('REFRESH_TOKEN_AGE', true) : 31556926)
    container
      .bind(TYPES.Auth_MAX_LOGIN_ATTEMPTS)
      .toConstantValue(env.get('MAX_LOGIN_ATTEMPTS', true) ? +env.get('MAX_LOGIN_ATTEMPTS', true) : 6)
    container
      .bind(TYPES.Auth_FAILED_LOGIN_LOCKOUT)
      .toConstantValue(env.get('FAILED_LOGIN_LOCKOUT', true) ? +env.get('FAILED_LOGIN_LOCKOUT', true) : 3600)
    container.bind(TYPES.Auth_PSEUDO_KEY_PARAMS_KEY).toConstantValue(env.get('PSEUDO_KEY_PARAMS_KEY'))
    container
      .bind(TYPES.Auth_EPHEMERAL_SESSION_AGE)
      .toConstantValue(env.get('EPHEMERAL_SESSION_AGE', true) ? +env.get('EPHEMERAL_SESSION_AGE', true) : 259200)
    container.bind(TYPES.Auth_REDIS_URL).toConstantValue(env.get('REDIS_URL', true))
    container
      .bind(TYPES.Auth_DISABLE_USER_REGISTRATION)
      .toConstantValue(env.get('DISABLE_USER_REGISTRATION', true) === 'true')
    container.bind(TYPES.Auth_SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
    container.bind(TYPES.Auth_SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL', true))
    container.bind(TYPES.Auth_VERSION).toConstantValue(env.get('VERSION', true) ?? 'development')
    container
      .bind(TYPES.Auth_SESSION_TRACE_DAYS_TTL)
      .toConstantValue(env.get('SESSION_TRACE_DAYS_TTL', true) ? +env.get('SESSION_TRACE_DAYS_TTL', true) : 90)
    container
      .bind(TYPES.Auth_U2F_RELYING_PARTY_NAME)
      .toConstantValue(env.get('U2F_RELYING_PARTY_NAME', true) ?? 'Standard Notes')
    container
      .bind(TYPES.Auth_U2F_RELYING_PARTY_ID)
      .toConstantValue(env.get('U2F_RELYING_PARTY_ID', true) ?? 'app.standardnotes.com')
    container
      .bind(TYPES.Auth_U2F_EXPECTED_ORIGIN)
      .toConstantValue(
        env.get('U2F_EXPECTED_ORIGIN', true)
          ? env.get('U2F_EXPECTED_ORIGIN', true).split(',')
          : ['https://app.standardnotes.com'],
      )
    container
      .bind(TYPES.Auth_U2F_REQUIRE_USER_VERIFICATION)
      .toConstantValue(env.get('U2F_REQUIRE_USER_VERIFICATION', true) === 'true')
    container
      .bind(TYPES.Auth_READONLY_USERS)
      .toConstantValue(env.get('READONLY_USERS', true) ? env.get('READONLY_USERS', true).split(',') : [])

    if (isConfiguredForInMemoryCache) {
      container
        .bind<PKCERepositoryInterface>(TYPES.Auth_PKCERepository)
        .toConstantValue(
          new TypeORMPKCERepository(
            container.get(TYPES.Auth_CacheEntryRepository),
            container.get(TYPES.Auth_Logger),
            container.get(TYPES.Auth_Timer),
          ),
        )
      container
        .bind<LockRepositoryInterface>(TYPES.Auth_LockRepository)
        .toConstantValue(
          new TypeORMLockRepository(
            container.get(TYPES.Auth_CacheEntryRepository),
            container.get(TYPES.Auth_Timer),
            container.get(TYPES.Auth_MAX_LOGIN_ATTEMPTS),
            container.get(TYPES.Auth_FAILED_LOGIN_LOCKOUT),
          ),
        )
      container
        .bind<EphemeralSessionRepositoryInterface>(TYPES.Auth_EphemeralSessionRepository)
        .toConstantValue(
          new TypeORMEphemeralSessionRepository(
            container.get(TYPES.Auth_CacheEntryRepository),
            container.get(TYPES.Auth_EPHEMERAL_SESSION_AGE),
            container.get(TYPES.Auth_Timer),
          ),
        )
      container
        .bind<OfflineSubscriptionTokenRepositoryInterface>(TYPES.Auth_OfflineSubscriptionTokenRepository)
        .toConstantValue(
          new TypeORMOfflineSubscriptionTokenRepository(
            container.get(TYPES.Auth_CacheEntryRepository),
            container.get(TYPES.Auth_Timer),
          ),
        )
      container
        .bind<SubscriptionTokenRepositoryInterface>(TYPES.Auth_SubscriptionTokenRepository)
        .toConstantValue(
          new TypeORMSubscriptionTokenRepository(
            container.get(TYPES.Auth_CacheEntryRepository),
            container.get(TYPES.Auth_Timer),
          ),
        )
    } else {
      container.bind<PKCERepositoryInterface>(TYPES.Auth_PKCERepository).to(RedisPKCERepository)
      container.bind<LockRepositoryInterface>(TYPES.Auth_LockRepository).to(LockRepository)
      container
        .bind<EphemeralSessionRepositoryInterface>(TYPES.Auth_EphemeralSessionRepository)
        .to(RedisEphemeralSessionRepository)
      container
        .bind<OfflineSubscriptionTokenRepositoryInterface>(TYPES.Auth_OfflineSubscriptionTokenRepository)
        .to(RedisOfflineSubscriptionTokenRepository)
      container
        .bind<SubscriptionTokenRepositoryInterface>(TYPES.Auth_SubscriptionTokenRepository)
        .to(RedisSubscriptionTokenRepository)
    }

    container
      .bind<TraceSession>(TYPES.Auth_TraceSession)
      .toConstantValue(
        new TraceSession(
          container.get(TYPES.Auth_SessionTraceRepository),
          container.get(TYPES.Auth_Timer),
          container.get(TYPES.Auth_SESSION_TRACE_DAYS_TTL),
        ),
      )
    container
      .bind<SelectorInterface<ProtocolVersion>>(TYPES.Auth_ProtocolVersionSelector)
      .toConstantValue(new DeterministicSelector<ProtocolVersion>())
    container.bind<UAParserInstance>(TYPES.Auth_DeviceDetector).toConstantValue(new UAParser())
    container.bind<CrypterInterface>(TYPES.Auth_Crypter).to(CrypterNode)
    container
      .bind<SettingCrypterInterface>(TYPES.Auth_SettingCrypter)
      .toConstantValue(
        new SettingCrypter(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<CrypterInterface>(TYPES.Auth_Crypter),
        ),
      )
    container
      .bind<GetSetting>(TYPES.Auth_GetSetting)
      .toConstantValue(
        new GetSetting(
          container.get<SettingRepositoryInterface>(TYPES.Auth_SettingRepository),
          container.get<SettingCrypterInterface>(TYPES.Auth_SettingCrypter),
        ),
      )
    container
      .bind<SessionService>(TYPES.Auth_SessionService)
      .toConstantValue(
        new SessionService(
          container.get<SessionRepositoryInterface>(TYPES.Auth_SessionRepository),
          container.get<EphemeralSessionRepositoryInterface>(TYPES.Auth_EphemeralSessionRepository),
          container.get<RevokedSessionRepositoryInterface>(TYPES.Auth_RevokedSessionRepository),
          container.get<UAParserInstance>(TYPES.Auth_DeviceDetector),
          container.get<TimerInterface>(TYPES.Auth_Timer),
          container.get<winston.Logger>(TYPES.Auth_Logger),
          container.get<number>(TYPES.Auth_ACCESS_TOKEN_AGE),
          container.get<number>(TYPES.Auth_REFRESH_TOKEN_AGE),
          container.get<CryptoNode>(TYPES.Auth_CryptoNode),
          container.get<TraceSession>(TYPES.Auth_TraceSession),
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
          container.get<string[]>(TYPES.Auth_READONLY_USERS),
          container.get<GetSetting>(TYPES.Auth_GetSetting),
        ),
      )
    container.bind<AuthResponseFactory20161215>(TYPES.Auth_AuthResponseFactory20161215).to(AuthResponseFactory20161215)
    container.bind<AuthResponseFactory20190520>(TYPES.Auth_AuthResponseFactory20190520).to(AuthResponseFactory20190520)
    container.bind<AuthResponseFactory20200115>(TYPES.Auth_AuthResponseFactory20200115).to(AuthResponseFactory20200115)
    container
      .bind<AuthResponseFactoryResolverInterface>(TYPES.Auth_AuthResponseFactoryResolver)
      .to(AuthResponseFactoryResolver)
    container.bind<KeyParamsFactory>(TYPES.Auth_KeyParamsFactory).to(KeyParamsFactory)
    container
      .bind<TokenDecoderInterface<SessionTokenData>>(TYPES.Auth_SessionTokenDecoder)
      .toConstantValue(new TokenDecoder<SessionTokenData>(container.get(TYPES.Auth_JWT_SECRET)))
    container
      .bind<TokenDecoderInterface<SessionTokenData>>(TYPES.Auth_FallbackSessionTokenDecoder)
      .toConstantValue(new TokenDecoder<SessionTokenData>(container.get(TYPES.Auth_LEGACY_JWT_SECRET)))
    container
      .bind<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.Auth_CrossServiceTokenDecoder)
      .toConstantValue(new TokenDecoder<CrossServiceTokenData>(container.get(TYPES.Auth_AUTH_JWT_SECRET)))
    container
      .bind<TokenDecoderInterface<OfflineUserTokenData>>(TYPES.Auth_OfflineUserTokenDecoder)
      .toConstantValue(new TokenDecoder<OfflineUserTokenData>(container.get(TYPES.Auth_AUTH_JWT_SECRET)))
    container
      .bind<TokenDecoderInterface<WebSocketConnectionTokenData>>(TYPES.Auth_WebSocketConnectionTokenDecoder)
      .toConstantValue(
        new TokenDecoder<WebSocketConnectionTokenData>(container.get(TYPES.Auth_WEB_SOCKET_CONNECTION_TOKEN_SECRET)),
      )
    container
      .bind<TokenEncoderInterface<OfflineUserTokenData>>(TYPES.Auth_OfflineUserTokenEncoder)
      .toConstantValue(new TokenEncoder<OfflineUserTokenData>(container.get(TYPES.Auth_AUTH_JWT_SECRET)))
    container
      .bind<TokenEncoderInterface<SessionTokenData>>(TYPES.Auth_SessionTokenEncoder)
      .toConstantValue(new TokenEncoder<SessionTokenData>(container.get(TYPES.Auth_JWT_SECRET)))
    container
      .bind<TokenEncoderInterface<CrossServiceTokenData>>(TYPES.Auth_CrossServiceTokenEncoder)
      .toConstantValue(new TokenEncoder<CrossServiceTokenData>(container.get(TYPES.Auth_AUTH_JWT_SECRET)))
    container
      .bind<TokenEncoderInterface<ValetTokenData>>(TYPES.Auth_ValetTokenEncoder)
      .toConstantValue(new TokenEncoder<ValetTokenData>(container.get(TYPES.Auth_VALET_TOKEN_SECRET)))
    container
      .bind<AuthenticationMethodResolver>(TYPES.Auth_AuthenticationMethodResolver)
      .to(AuthenticationMethodResolver)
    container.bind<DomainEventFactory>(TYPES.Auth_DomainEventFactory).to(DomainEventFactory)
    container
      .bind<SettingsAssociationServiceInterface>(TYPES.Auth_SettingsAssociationService)
      .to(SettingsAssociationService)

    container
      .bind<GetUserKeyParams>(TYPES.Auth_GetUserKeyParams)
      .toConstantValue(
        new GetUserKeyParams(
          container.get<KeyParamsFactoryInterface>(TYPES.Auth_KeyParamsFactory),
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<PKCERepositoryInterface>(TYPES.Auth_PKCERepository),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )

    container.bind<OfflineSettingServiceInterface>(TYPES.Auth_OfflineSettingService).to(OfflineSettingService)
    container.bind<ContentDecoderInterface>(TYPES.Auth_ContenDecoder).toConstantValue(new ContentDecoder())
    container.bind<ClientServiceInterface>(TYPES.Auth_WebSocketsClientService).to(WebSocketsClientService)
    container.bind<RoleServiceInterface>(TYPES.Auth_RoleService).to(RoleService)
    container.bind<RoleToSubscriptionMapInterface>(TYPES.Auth_RoleToSubscriptionMap).to(RoleToSubscriptionMap)
    container
      .bind<SubscriptionSettingsAssociationServiceInterface>(TYPES.Auth_SubscriptionSettingsAssociationService)
      .to(SubscriptionSettingsAssociationService)
    container
      .bind<FeatureServiceInterface>(TYPES.Auth_FeatureService)
      .toConstantValue(
        new FeatureService(
          container.get<RoleToSubscriptionMapInterface>(TYPES.Auth_RoleToSubscriptionMap),
          container.get<OfflineUserSubscriptionRepositoryInterface>(TYPES.Auth_OfflineUserSubscriptionRepository),
          container.get<TimerInterface>(TYPES.Auth_Timer),
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
        ),
      )
    container
      .bind<SelectorInterface<boolean>>(TYPES.Auth_BooleanSelector)
      .toConstantValue(new DeterministicSelector<boolean>())

    // Middleware
    container.bind<SessionMiddleware>(TYPES.Auth_SessionMiddleware).to(SessionMiddleware)
    container.bind<LockMiddleware>(TYPES.Auth_LockMiddleware).to(LockMiddleware)
    container
      .bind<RequiredCrossServiceTokenMiddleware>(TYPES.Auth_RequiredCrossServiceTokenMiddleware)
      .toConstantValue(
        new RequiredCrossServiceTokenMiddleware(
          container.get<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.Auth_CrossServiceTokenDecoder),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<OptionalCrossServiceTokenMiddleware>(TYPES.Auth_OptionalCrossServiceTokenMiddleware)
      .toConstantValue(
        new OptionalCrossServiceTokenMiddleware(
          container.get<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.Auth_CrossServiceTokenDecoder),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<ApiGatewayOfflineAuthMiddleware>(TYPES.Auth_ApiGatewayOfflineAuthMiddleware)
      .to(ApiGatewayOfflineAuthMiddleware)
    container.bind<OfflineUserAuthMiddleware>(TYPES.Auth_OfflineUserAuthMiddleware).to(OfflineUserAuthMiddleware)

    // use cases
    container
      .bind<PersistStatistics>(TYPES.Auth_PersistStatistics)
      .toConstantValue(
        new PersistStatistics(
          container.get(TYPES.Auth_SessionTraceRepository),
          container.get(TYPES.Auth_DomainEventPublisher),
          container.get(TYPES.Auth_DomainEventFactory),
          container.get(TYPES.Auth_Timer),
        ),
      )
    container
      .bind<GenerateAuthenticatorRegistrationOptions>(TYPES.Auth_GenerateAuthenticatorRegistrationOptions)
      .toConstantValue(
        new GenerateAuthenticatorRegistrationOptions(
          container.get(TYPES.Auth_AuthenticatorRepository),
          container.get(TYPES.Auth_AuthenticatorChallengeRepository),
          container.get(TYPES.Auth_U2F_RELYING_PARTY_NAME),
          container.get(TYPES.Auth_U2F_RELYING_PARTY_ID),
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_FeatureService),
        ),
      )
    container
      .bind<VerifyAuthenticatorRegistrationResponse>(TYPES.Auth_VerifyAuthenticatorRegistrationResponse)
      .toConstantValue(
        new VerifyAuthenticatorRegistrationResponse(
          container.get(TYPES.Auth_AuthenticatorRepository),
          container.get(TYPES.Auth_AuthenticatorChallengeRepository),
          container.get(TYPES.Auth_U2F_RELYING_PARTY_ID),
          container.get(TYPES.Auth_U2F_EXPECTED_ORIGIN),
          container.get(TYPES.Auth_U2F_REQUIRE_USER_VERIFICATION),
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_FeatureService),
        ),
      )
    container
      .bind<GenerateAuthenticatorAuthenticationOptions>(TYPES.Auth_GenerateAuthenticatorAuthenticationOptions)
      .toConstantValue(
        new GenerateAuthenticatorAuthenticationOptions(
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_AuthenticatorRepository),
          container.get(TYPES.Auth_AuthenticatorChallengeRepository),
          container.get(TYPES.Auth_PSEUDO_KEY_PARAMS_KEY),
        ),
      )
    container
      .bind<VerifyAuthenticatorAuthenticationResponse>(TYPES.Auth_VerifyAuthenticatorAuthenticationResponse)
      .toConstantValue(
        new VerifyAuthenticatorAuthenticationResponse(
          container.get(TYPES.Auth_AuthenticatorRepository),
          container.get(TYPES.Auth_AuthenticatorChallengeRepository),
          container.get(TYPES.Auth_U2F_RELYING_PARTY_ID),
          container.get(TYPES.Auth_U2F_EXPECTED_ORIGIN),
          container.get(TYPES.Auth_U2F_REQUIRE_USER_VERIFICATION),
        ),
      )
    container
      .bind<ListAuthenticators>(TYPES.Auth_ListAuthenticators)
      .toConstantValue(
        new ListAuthenticators(
          container.get(TYPES.Auth_AuthenticatorRepository),
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_FeatureService),
        ),
      )
    container
      .bind<DeleteAuthenticator>(TYPES.Auth_DeleteAuthenticator)
      .toConstantValue(
        new DeleteAuthenticator(
          container.get(TYPES.Auth_AuthenticatorRepository),
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_FeatureService),
        ),
      )
    container
      .bind<SetSettingValue>(TYPES.Auth_SetSettingValue)
      .toConstantValue(
        new SetSettingValue(
          container.get<GetSetting>(TYPES.Auth_GetSetting),
          container.get<SettingRepositoryInterface>(TYPES.Auth_SettingRepository),
          container.get<TimerInterface>(TYPES.Auth_Timer),
          container.get<SettingsAssociationServiceInterface>(TYPES.Auth_SettingsAssociationService),
          container.get<RoleServiceInterface>(TYPES.Auth_RoleService),
          container.get<SettingCrypterInterface>(TYPES.Auth_SettingCrypter),
        ),
      )
    container
      .bind<GenerateRecoveryCodes>(TYPES.Auth_GenerateRecoveryCodes)
      .toConstantValue(
        new GenerateRecoveryCodes(
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_SetSettingValue),
          container.get(TYPES.Auth_CryptoNode),
        ),
      )
    container
      .bind<GetSubscriptionSetting>(TYPES.Auth_GetSubscriptionSetting)
      .toConstantValue(
        new GetSubscriptionSetting(
          container.get<SubscriptionSettingRepositoryInterface>(TYPES.Auth_SubscriptionSettingRepository),
          container.get<SettingCrypterInterface>(TYPES.Auth_SettingCrypter),
        ),
      )
    container
      .bind<SetSubscriptionSettingValue>(TYPES.Auth_SetSubscriptionSettingValue)
      .toConstantValue(
        new SetSubscriptionSettingValue(
          container.get<SubscriptionSettingRepositoryInterface>(TYPES.Auth_SubscriptionSettingRepository),
          container.get<GetSubscriptionSetting>(TYPES.Auth_GetSubscriptionSetting),
          container.get<TimerInterface>(TYPES.Auth_Timer),
        ),
      )
    container
      .bind<ApplyDefaultSubscriptionSettings>(TYPES.Auth_ApplyDefaultSubscriptionSettings)
      .toConstantValue(
        new ApplyDefaultSubscriptionSettings(
          container.get<SubscriptionSettingsAssociationServiceInterface>(
            TYPES.Auth_SubscriptionSettingsAssociationService,
          ),
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
          container.get<GetSubscriptionSetting>(TYPES.Auth_GetSubscriptionSetting),
          container.get<SetSubscriptionSettingValue>(TYPES.Auth_SetSubscriptionSettingValue),
        ),
      )
    container
      .bind<ActivatePremiumFeatures>(TYPES.Auth_ActivatePremiumFeatures)
      .toConstantValue(
        new ActivatePremiumFeatures(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
          container.get<ApplyDefaultSubscriptionSettings>(TYPES.Auth_ApplyDefaultSubscriptionSettings),
          container.get<RoleServiceInterface>(TYPES.Auth_RoleService),
          container.get<TimerInterface>(TYPES.Auth_Timer),
        ),
      )

    container
      .bind<CleanupSessionTraces>(TYPES.Auth_CleanupSessionTraces)
      .toConstantValue(new CleanupSessionTraces(container.get(TYPES.Auth_SessionTraceRepository)))
    container
      .bind<CleanupExpiredSessions>(TYPES.Auth_CleanupExpiredSessions)
      .toConstantValue(new CleanupExpiredSessions(container.get(TYPES.Auth_SessionRepository)))
    container.bind<AuthenticateUser>(TYPES.Auth_AuthenticateUser).to(AuthenticateUser)
    container.bind<AuthenticateRequest>(TYPES.Auth_AuthenticateRequest).to(AuthenticateRequest)
    container
      .bind<RefreshSessionToken>(TYPES.Auth_RefreshSessionToken)
      .toConstantValue(
        new RefreshSessionToken(
          container.get<SessionServiceInterface>(TYPES.Auth_SessionService),
          container.get<DomainEventFactoryInterface>(TYPES.Auth_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher),
          container.get<TimerInterface>(TYPES.Auth_Timer),
          container.get<GetSetting>(TYPES.Auth_GetSetting),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container.bind<SignIn>(TYPES.Auth_SignIn).to(SignIn)
    container
      .bind<VerifyMFA>(TYPES.Auth_VerifyMFA)
      .toConstantValue(
        new VerifyMFA(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<SelectorInterface<boolean>>(TYPES.Auth_BooleanSelector),
          container.get<LockRepositoryInterface>(TYPES.Auth_LockRepository),
          container.get<string>(TYPES.Auth_PSEUDO_KEY_PARAMS_KEY),
          container.get<AuthenticatorRepositoryInterface>(TYPES.Auth_AuthenticatorRepository),
          container.get<VerifyAuthenticatorAuthenticationResponse>(
            TYPES.Auth_VerifyAuthenticatorAuthenticationResponse,
          ),
          container.get<GetSetting>(TYPES.Auth_GetSetting),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container.bind<ClearLoginAttempts>(TYPES.Auth_ClearLoginAttempts).to(ClearLoginAttempts)
    container.bind<IncreaseLoginAttempts>(TYPES.Auth_IncreaseLoginAttempts).to(IncreaseLoginAttempts)
    container
      .bind<GetUserKeyParamsRecovery>(TYPES.Auth_GetUserKeyParamsRecovery)
      .toConstantValue(
        new GetUserKeyParamsRecovery(
          container.get<KeyParamsFactoryInterface>(TYPES.Auth_KeyParamsFactory),
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<PKCERepositoryInterface>(TYPES.Auth_PKCERepository),
          container.get<GetSetting>(TYPES.Auth_GetSetting),
        ),
      )
    container.bind<UpdateUser>(TYPES.Auth_UpdateUser).to(UpdateUser)
    container
      .bind<ApplyDefaultSettings>(TYPES.Auth_ApplyDefaultSettings)
      .toConstantValue(
        new ApplyDefaultSettings(
          container.get<SettingsAssociationServiceInterface>(TYPES.Auth_SettingsAssociationService),
          container.get<SetSettingValue>(TYPES.Auth_SetSettingValue),
        ),
      )
    container
      .bind<Register>(TYPES.Auth_Register)
      .toConstantValue(
        new Register(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<RoleRepositoryInterface>(TYPES.Auth_RoleRepository),
          container.get<AuthResponseFactory20200115>(TYPES.Auth_AuthResponseFactory20200115),
          container.get<CrypterInterface>(TYPES.Auth_Crypter),
          container.get<boolean>(TYPES.Auth_DISABLE_USER_REGISTRATION),
          container.get<TimerInterface>(TYPES.Auth_Timer),
          container.get<ApplyDefaultSettings>(TYPES.Auth_ApplyDefaultSettings),
        ),
      )
    container.bind<GetActiveSessionsForUser>(TYPES.Auth_GetActiveSessionsForUser).to(GetActiveSessionsForUser)
    container.bind<DeleteOtherSessionsForUser>(TYPES.Auth_DeleteOtherSessionsForUser).to(DeleteOtherSessionsForUser)
    container.bind<DeleteSessionForUser>(TYPES.Auth_DeleteSessionForUser).to(DeleteSessionForUser)
    container
      .bind<ChangeCredentials>(TYPES.Auth_ChangeCredentials)
      .toConstantValue(
        new ChangeCredentials(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<AuthResponseFactoryResolverInterface>(TYPES.Auth_AuthResponseFactoryResolver),
          container.get<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher),
          container.get<DomainEventFactoryInterface>(TYPES.Auth_DomainEventFactory),
          container.get<TimerInterface>(TYPES.Auth_Timer),
          container.get<DeleteOtherSessionsForUser>(TYPES.Auth_DeleteOtherSessionsForUser),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<GetSettings>(TYPES.Auth_GetSettings)
      .toConstantValue(
        new GetSettings(
          container.get<SettingRepositoryInterface>(TYPES.Auth_SettingRepository),
          container.get<SettingCrypterInterface>(TYPES.Auth_SettingCrypter),
        ),
      )
    container
      .bind<GetSubscriptionSettings>(TYPES.Auth_GetSubscriptionSettings)
      .toConstantValue(
        new GetSubscriptionSettings(
          container.get<SubscriptionSettingRepositoryInterface>(TYPES.Auth_SubscriptionSettingRepository),
          container.get<SettingCrypterInterface>(TYPES.Auth_SettingCrypter),
        ),
      )
    container
      .bind<GetRegularSubscriptionForUser>(TYPES.Auth_GetRegularSubscriptionForUser)
      .toConstantValue(
        new GetRegularSubscriptionForUser(
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
        ),
      )
    container
      .bind<GetSharedSubscriptionForUser>(TYPES.Auth_GetSharedSubscriptionForUser)
      .toConstantValue(
        new GetSharedSubscriptionForUser(
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
        ),
      )
    container
      .bind<GetSharedOrRegularSubscriptionForUser>(TYPES.Auth_GetSharedOrRegularSubscriptionForUser)
      .toConstantValue(
        new GetSharedOrRegularSubscriptionForUser(
          container.get<GetRegularSubscriptionForUser>(TYPES.Auth_GetRegularSubscriptionForUser),
          container.get<GetSharedSubscriptionForUser>(TYPES.Auth_GetSharedSubscriptionForUser),
        ),
      )
    container
      .bind<GetAllSettingsForUser>(TYPES.Auth_GetAllSettingsForUser)
      .toConstantValue(
        new GetAllSettingsForUser(
          container.get<GetSettings>(TYPES.Auth_GetSettings),
          container.get<GetSharedOrRegularSubscriptionForUser>(TYPES.Auth_GetSharedOrRegularSubscriptionForUser),
          container.get<GetSubscriptionSettings>(TYPES.Auth_GetSubscriptionSettings),
        ),
      )
    container.bind<GetUserFeatures>(TYPES.Auth_GetUserFeatures).to(GetUserFeatures)
    container.bind<DeleteSetting>(TYPES.Auth_DeleteSetting).to(DeleteSetting)
    container
      .bind<SignInWithRecoveryCodes>(TYPES.Auth_SignInWithRecoveryCodes)
      .toConstantValue(
        new SignInWithRecoveryCodes(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<AuthResponseFactory20200115>(TYPES.Auth_AuthResponseFactory20200115),
          container.get<PKCERepositoryInterface>(TYPES.Auth_PKCERepository),
          container.get<CrypterInterface>(TYPES.Auth_Crypter),
          container.get<GetSetting>(TYPES.Auth_GetSetting),
          container.get<GenerateRecoveryCodes>(TYPES.Auth_GenerateRecoveryCodes),
          container.get<IncreaseLoginAttempts>(TYPES.Auth_IncreaseLoginAttempts),
          container.get<ClearLoginAttempts>(TYPES.Auth_ClearLoginAttempts),
          container.get<DeleteSetting>(TYPES.Auth_DeleteSetting),
          container.get<AuthenticatorRepositoryInterface>(TYPES.Auth_AuthenticatorRepository),
        ),
      )
    container
      .bind<DeleteAccount>(TYPES.Auth_DeleteAccount)
      .toConstantValue(
        new DeleteAccount(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<GetRegularSubscriptionForUser>(TYPES.Auth_GetRegularSubscriptionForUser),
          container.get<GetSharedSubscriptionForUser>(TYPES.Auth_GetSharedSubscriptionForUser),
          container.get<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher),
          container.get<DomainEventFactoryInterface>(TYPES.Auth_DomainEventFactory),
          container.get<TimerInterface>(TYPES.Auth_Timer),
        ),
      )
    container.bind<GetUserSubscription>(TYPES.Auth_GetUserSubscription).to(GetUserSubscription)
    container.bind<GetUserOfflineSubscription>(TYPES.Auth_GetUserOfflineSubscription).to(GetUserOfflineSubscription)
    container.bind<CreateSubscriptionToken>(TYPES.Auth_CreateSubscriptionToken).to(CreateSubscriptionToken)
    container
      .bind<AuthenticateSubscriptionToken>(TYPES.Auth_AuthenticateSubscriptionToken)
      .to(AuthenticateSubscriptionToken)
    container
      .bind<AuthenticateOfflineSubscriptionToken>(TYPES.Auth_AuthenticateOfflineSubscriptionToken)
      .to(AuthenticateOfflineSubscriptionToken)
    container
      .bind<CreateOfflineSubscriptionToken>(TYPES.Auth_CreateOfflineSubscriptionToken)
      .to(CreateOfflineSubscriptionToken)
    container
      .bind<CreateValetToken>(TYPES.Auth_CreateValetToken)
      .toConstantValue(
        new CreateValetToken(
          container.get<TokenEncoderInterface<ValetTokenData>>(TYPES.Auth_ValetTokenEncoder),
          container.get<SubscriptionSettingsAssociationServiceInterface>(
            TYPES.Auth_SubscriptionSettingsAssociationService,
          ),
          container.get<GetRegularSubscriptionForUser>(TYPES.Auth_GetRegularSubscriptionForUser),
          container.get<GetSharedSubscriptionForUser>(TYPES.Auth_GetSharedSubscriptionForUser),
          container.get<GetSubscriptionSetting>(TYPES.Auth_GetSubscriptionSetting),
          container.get<TimerInterface>(TYPES.Auth_Timer),
          container.get<number>(TYPES.Auth_VALET_TOKEN_TTL),
        ),
      )
    container.bind<CreateListedAccount>(TYPES.Auth_CreateListedAccount).to(CreateListedAccount)
    container.bind<InviteToSharedSubscription>(TYPES.Auth_InviteToSharedSubscription).to(InviteToSharedSubscription)
    container
      .bind<AcceptSharedSubscriptionInvitation>(TYPES.Auth_AcceptSharedSubscriptionInvitation)
      .toConstantValue(
        new AcceptSharedSubscriptionInvitation(
          container.get<SharedSubscriptionInvitationRepositoryInterface>(
            TYPES.Auth_SharedSubscriptionInvitationRepository,
          ),
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
          container.get<RoleServiceInterface>(TYPES.Auth_RoleService),
          container.get<ApplyDefaultSubscriptionSettings>(TYPES.Auth_ApplyDefaultSubscriptionSettings),
          container.get<TimerInterface>(TYPES.Auth_Timer),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<DeclineSharedSubscriptionInvitation>(TYPES.Auth_DeclineSharedSubscriptionInvitation)
      .to(DeclineSharedSubscriptionInvitation)
    container
      .bind<CancelSharedSubscriptionInvitation>(TYPES.Auth_CancelSharedSubscriptionInvitation)
      .to(CancelSharedSubscriptionInvitation)
    container
      .bind<ListSharedSubscriptionInvitations>(TYPES.Auth_ListSharedSubscriptionInvitations)
      .to(ListSharedSubscriptionInvitations)
    container.bind<VerifyPredicate>(TYPES.Auth_VerifyPredicate).to(VerifyPredicate)
    container
      .bind<CreateCrossServiceToken>(TYPES.Auth_CreateCrossServiceToken)
      .toConstantValue(
        new CreateCrossServiceToken(
          container.get<ProjectorInterface<User>>(TYPES.Auth_UserProjector),
          container.get<ProjectorInterface<Session>>(TYPES.Auth_SessionProjector),
          container.get<ProjectorInterface<Role>>(TYPES.Auth_RoleProjector),
          container.get<TokenEncoderInterface<CrossServiceTokenData>>(TYPES.Auth_CrossServiceTokenEncoder),
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<number>(TYPES.Auth_AUTH_JWT_TTL),
          container.get<GetRegularSubscriptionForUser>(TYPES.Auth_GetRegularSubscriptionForUser),
          container.get<GetSubscriptionSetting>(TYPES.Auth_GetSubscriptionSetting),
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Auth_SharedVaultUserRepository),
          container.get<GetActiveSessionsForUser>(TYPES.Auth_GetActiveSessionsForUser),
        ),
      )
    container.bind<ProcessUserRequest>(TYPES.Auth_ProcessUserRequest).to(ProcessUserRequest)
    container
      .bind<UpdateStorageQuotaUsedForUser>(TYPES.Auth_UpdateStorageQuotaUsedForUser)
      .toConstantValue(
        new UpdateStorageQuotaUsedForUser(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<GetRegularSubscriptionForUser>(TYPES.Auth_GetRegularSubscriptionForUser),
          container.get<GetSharedSubscriptionForUser>(TYPES.Auth_GetSharedSubscriptionForUser),
          container.get<GetSubscriptionSetting>(TYPES.Auth_GetSubscriptionSetting),
          container.get<SetSubscriptionSettingValue>(TYPES.Auth_SetSubscriptionSettingValue),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<AddSharedVaultUser>(TYPES.Auth_AddSharedVaultUser)
      .toConstantValue(
        new AddSharedVaultUser(container.get<SharedVaultUserRepositoryInterface>(TYPES.Auth_SharedVaultUserRepository)),
      )
    container
      .bind<RemoveSharedVaultUser>(TYPES.Auth_RemoveSharedVaultUser)
      .toConstantValue(
        new RemoveSharedVaultUser(
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Auth_SharedVaultUserRepository),
        ),
      )
    container
      .bind<DesignateSurvivor>(TYPES.Auth_DesignateSurvivor)
      .toConstantValue(
        new DesignateSurvivor(
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Auth_SharedVaultUserRepository),
          container.get<TimerInterface>(TYPES.Auth_Timer),
        ),
      )
    container
      .bind<DisableEmailSettingBasedOnEmailSubscription>(TYPES.Auth_DisableEmailSettingBasedOnEmailSubscription)
      .toConstantValue(
        new DisableEmailSettingBasedOnEmailSubscription(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<SetSettingValue>(TYPES.Auth_SetSettingValue),
          container.get<SetSubscriptionSettingValue>(TYPES.Auth_SetSubscriptionSettingValue),
          container.get<GetSharedOrRegularSubscriptionForUser>(TYPES.Auth_GetSharedOrRegularSubscriptionForUser),
        ),
      )
    container
      .bind<TriggerEmailBackupForUser>(TYPES.Auth_TriggerEmailBackupForUser)
      .toConstantValue(
        new TriggerEmailBackupForUser(
          container.get<RoleServiceInterface>(TYPES.Auth_RoleService),
          container.get<GetSetting>(TYPES.Auth_GetSetting),
          container.get<GetUserKeyParams>(TYPES.Auth_GetUserKeyParams),
          container.get<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher),
          container.get<DomainEventFactoryInterface>(TYPES.Auth_DomainEventFactory),
        ),
      )
    container
      .bind<TriggerEmailBackupForAllUsers>(TYPES.Auth_TriggerEmailBackupForAllUsers)
      .toConstantValue(
        new TriggerEmailBackupForAllUsers(
          container.get<SettingRepositoryInterface>(TYPES.Auth_SettingRepository),
          container.get<TriggerEmailBackupForUser>(TYPES.Auth_TriggerEmailBackupForUser),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<TriggerPostSettingUpdateActions>(TYPES.Auth_TriggerPostSettingUpdateActions)
      .toConstantValue(
        new TriggerPostSettingUpdateActions(
          container.get<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher),
          container.get<DomainEventFactoryInterface>(TYPES.Auth_DomainEventFactory),
          container.get<TriggerEmailBackupForUser>(TYPES.Auth_TriggerEmailBackupForUser),
          container.get<GenerateRecoveryCodes>(TYPES.Auth_GenerateRecoveryCodes),
        ),
      )
    container
      .bind<RenewSharedSubscriptions>(TYPES.Auth_RenewSharedSubscriptions)
      .toConstantValue(
        new RenewSharedSubscriptions(
          container.get<ListSharedSubscriptionInvitations>(TYPES.Auth_ListSharedSubscriptionInvitations),
          container.get<SharedSubscriptionInvitationRepositoryInterface>(
            TYPES.Auth_SharedSubscriptionInvitationRepository,
          ),
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<RoleServiceInterface>(TYPES.Auth_RoleService),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<FixStorageQuotaForUser>(TYPES.Auth_FixStorageQuotaForUser)
      .toConstantValue(
        new FixStorageQuotaForUser(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<GetRegularSubscriptionForUser>(TYPES.Auth_GetRegularSubscriptionForUser),
          container.get<GetSharedSubscriptionForUser>(TYPES.Auth_GetSharedSubscriptionForUser),
          container.get<SetSubscriptionSettingValue>(TYPES.Auth_SetSubscriptionSettingValue),
          container.get<ListSharedSubscriptionInvitations>(TYPES.Auth_ListSharedSubscriptionInvitations),
          container.get<DomainEventFactoryInterface>(TYPES.Auth_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    if (!isConfiguredForHomeServer) {
      container
        .bind<DeleteAccountsFromCSVFile>(TYPES.Auth_DeleteAccountsFromCSVFile)
        .toConstantValue(
          new DeleteAccountsFromCSVFile(
            container.get<CSVFileReaderInterface>(TYPES.Auth_CSVFileReader),
            container.get<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher),
            container.get<DomainEventFactoryInterface>(TYPES.Auth_DomainEventFactory),
            container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
            container.get<winston.Logger>(TYPES.Auth_Logger),
          ),
        )
    }

    // Controller
    container
      .bind<ControllerContainerInterface>(TYPES.Auth_ControllerContainer)
      .toConstantValue(configuration?.controllerConatiner ?? new ControllerContainer())
    container
      .bind<AuthController>(TYPES.Auth_AuthController)
      .toConstantValue(
        new AuthController(
          container.get(TYPES.Auth_ClearLoginAttempts),
          container.get(TYPES.Auth_Register),
          container.get(TYPES.Auth_DomainEventPublisher),
          container.get(TYPES.Auth_DomainEventFactory),
          container.get(TYPES.Auth_SignInWithRecoveryCodes),
          container.get(TYPES.Auth_GetUserKeyParamsRecovery),
          container.get(TYPES.Auth_GenerateRecoveryCodes),
          container.get(TYPES.Auth_Logger),
          container.get(TYPES.Auth_SessionService),
        ),
      )
    container
      .bind<AuthenticatorsController>(TYPES.Auth_AuthenticatorsController)
      .toConstantValue(
        new AuthenticatorsController(
          container.get(TYPES.Auth_GenerateAuthenticatorRegistrationOptions),
          container.get(TYPES.Auth_VerifyAuthenticatorRegistrationResponse),
          container.get(TYPES.Auth_GenerateAuthenticatorAuthenticationOptions),
          container.get(TYPES.Auth_ListAuthenticators),
          container.get(TYPES.Auth_DeleteAuthenticator),
          container.get(TYPES.Auth_AuthenticatorHttpMapper),
        ),
      )
    container
      .bind<SubscriptionInvitesController>(TYPES.Auth_SubscriptionInvitesController)
      .to(SubscriptionInvitesController)
    container.bind<UserRequestsController>(TYPES.Auth_UserRequestsController).to(UserRequestsController)

    // Handlers
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.Auth_AccountDeletionRequestedEventHandler)
      .toConstantValue(
        new AccountDeletionRequestedEventHandler(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<SessionRepositoryInterface>(TYPES.Auth_SessionRepository),
          container.get<EphemeralSessionRepositoryInterface>(TYPES.Auth_EphemeralSessionRepository),
          container.get<RevokedSessionRepositoryInterface>(TYPES.Auth_RevokedSessionRepository),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<AccountDeletionVerificationPassedEventHandler>(TYPES.Auth_AccountDeletionVerificationPassedEventHandler)
      .toConstantValue(
        new AccountDeletionVerificationPassedEventHandler(
          container.get<DeleteAccount>(TYPES.Auth_DeleteAccount),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<SubscriptionPurchasedEventHandler>(TYPES.Auth_SubscriptionPurchasedEventHandler)
      .toConstantValue(
        new SubscriptionPurchasedEventHandler(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
          container.get<ApplyDefaultSubscriptionSettings>(TYPES.Auth_ApplyDefaultSubscriptionSettings),
          container.get<OfflineUserSubscriptionRepositoryInterface>(TYPES.Auth_OfflineUserSubscriptionRepository),
          container.get<RoleServiceInterface>(TYPES.Auth_RoleService),
          container.get<RenewSharedSubscriptions>(TYPES.Auth_RenewSharedSubscriptions),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<SubscriptionCancelledEventHandler>(TYPES.Auth_SubscriptionCancelledEventHandler)
      .to(SubscriptionCancelledEventHandler)
    container
      .bind<SubscriptionRenewedEventHandler>(TYPES.Auth_SubscriptionRenewedEventHandler)
      .to(SubscriptionRenewedEventHandler)
    container
      .bind<SubscriptionRefundedEventHandler>(TYPES.Auth_SubscriptionRefundedEventHandler)
      .to(SubscriptionRefundedEventHandler)
    container
      .bind<SubscriptionExpiredEventHandler>(TYPES.Auth_SubscriptionExpiredEventHandler)
      .to(SubscriptionExpiredEventHandler)
    container
      .bind<SubscriptionSyncRequestedEventHandler>(TYPES.Auth_SubscriptionSyncRequestedEventHandler)
      .toConstantValue(
        new SubscriptionSyncRequestedEventHandler(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
          container.get<OfflineUserSubscriptionRepositoryInterface>(TYPES.Auth_OfflineUserSubscriptionRepository),
          container.get<RoleServiceInterface>(TYPES.Auth_RoleService),
          container.get<ApplyDefaultSubscriptionSettings>(TYPES.Auth_ApplyDefaultSubscriptionSettings),
          container.get<SetSettingValue>(TYPES.Auth_SetSettingValue),
          container.get<OfflineSettingServiceInterface>(TYPES.Auth_OfflineSettingService),
          container.get<ContentDecoderInterface>(TYPES.Auth_ContenDecoder),
          container.get<RenewSharedSubscriptions>(TYPES.Auth_RenewSharedSubscriptions),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<ExtensionKeyGrantedEventHandler>(TYPES.Auth_ExtensionKeyGrantedEventHandler)
      .toConstantValue(
        new ExtensionKeyGrantedEventHandler(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<SetSettingValue>(TYPES.Auth_SetSettingValue),
          container.get<OfflineSettingServiceInterface>(TYPES.Auth_OfflineSettingService),
          container.get<ContentDecoderInterface>(TYPES.Auth_ContenDecoder),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<SubscriptionReassignedEventHandler>(TYPES.Auth_SubscriptionReassignedEventHandler)
      .toConstantValue(
        new SubscriptionReassignedEventHandler(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
          container.get<RoleServiceInterface>(TYPES.Auth_RoleService),
          container.get<winston.Logger>(TYPES.Auth_Logger),
          container.get<ApplyDefaultSubscriptionSettings>(TYPES.Auth_ApplyDefaultSubscriptionSettings),
          container.get<SetSettingValue>(TYPES.Auth_SetSettingValue),
        ),
      )
    container
      .bind<FileUploadedEventHandler>(TYPES.Auth_FileUploadedEventHandler)
      .toConstantValue(
        new FileUploadedEventHandler(
          container.get(TYPES.Auth_UpdateStorageQuotaUsedForUser),
          container.get(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<SharedVaultFileUploadedEventHandler>(TYPES.Auth_SharedVaultFileUploadedEventHandler)
      .toConstantValue(
        new SharedVaultFileUploadedEventHandler(
          container.get(TYPES.Auth_UpdateStorageQuotaUsedForUser),
          container.get(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<SharedVaultFileMovedEventHandler>(TYPES.Auth_SharedVaultFileMovedEventHandler)
      .toConstantValue(
        new SharedVaultFileMovedEventHandler(
          container.get(TYPES.Auth_UpdateStorageQuotaUsedForUser),
          container.get(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<FileRemovedEventHandler>(TYPES.Auth_FileRemovedEventHandler)
      .toConstantValue(
        new FileRemovedEventHandler(
          container.get(TYPES.Auth_UpdateStorageQuotaUsedForUser),
          container.get(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<SharedVaultFileRemovedEventHandler>(TYPES.Auth_SharedVaultFileRemovedEventHandler)
      .toConstantValue(
        new SharedVaultFileRemovedEventHandler(
          container.get(TYPES.Auth_UpdateStorageQuotaUsedForUser),
          container.get(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<ListedAccountCreatedEventHandler>(TYPES.Auth_ListedAccountCreatedEventHandler)
      .toConstantValue(
        new ListedAccountCreatedEventHandler(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<GetSetting>(TYPES.Auth_GetSetting),
          container.get<SetSettingValue>(TYPES.Auth_SetSettingValue),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<ListedAccountDeletedEventHandler>(TYPES.Auth_ListedAccountDeletedEventHandler)
      .toConstantValue(
        new ListedAccountDeletedEventHandler(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<GetSetting>(TYPES.Auth_GetSetting),
          container.get<SetSettingValue>(TYPES.Auth_SetSettingValue),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<UserDisabledSessionUserAgentLoggingEventHandler>(TYPES.Auth_UserDisabledSessionUserAgentLoggingEventHandler)
      .to(UserDisabledSessionUserAgentLoggingEventHandler)
    container
      .bind<SharedSubscriptionInvitationCreatedEventHandler>(TYPES.Auth_SharedSubscriptionInvitationCreatedEventHandler)
      .to(SharedSubscriptionInvitationCreatedEventHandler)
    container
      .bind<PredicateVerificationRequestedEventHandler>(TYPES.Auth_PredicateVerificationRequestedEventHandler)
      .to(PredicateVerificationRequestedEventHandler)

    container
      .bind<EmailSubscriptionUnsubscribedEventHandler>(TYPES.Auth_EmailSubscriptionUnsubscribedEventHandler)
      .toConstantValue(
        new EmailSubscriptionUnsubscribedEventHandler(
          container.get<DisableEmailSettingBasedOnEmailSubscription>(
            TYPES.Auth_DisableEmailSettingBasedOnEmailSubscription,
          ),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<PaymentsAccountDeletedEventHandler>(TYPES.Auth_PaymentsAccountDeletedEventHandler)
      .toConstantValue(
        new PaymentsAccountDeletedEventHandler(
          container.get(TYPES.Auth_DeleteAccount),
          container.get(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<UserAddedToSharedVaultEventHandler>(TYPES.Auth_UserAddedToSharedVaultEventHandler)
      .toConstantValue(
        new UserAddedToSharedVaultEventHandler(
          container.get<AddSharedVaultUser>(TYPES.Auth_AddSharedVaultUser),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<UserRemovedFromSharedVaultEventHandler>(TYPES.Auth_UserRemovedFromSharedVaultEventHandler)
      .toConstantValue(
        new UserRemovedFromSharedVaultEventHandler(
          container.get<RemoveSharedVaultUser>(TYPES.Auth_RemoveSharedVaultUser),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<UserDesignatedAsSurvivorInSharedVaultEventHandler>(
        TYPES.Auth_UserDesignatedAsSurvivorInSharedVaultEventHandler,
      )
      .toConstantValue(
        new UserDesignatedAsSurvivorInSharedVaultEventHandler(
          container.get<DesignateSurvivor>(TYPES.Auth_DesignateSurvivor),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<UserInvitedToSharedVaultEventHandler>(TYPES.Auth_UserInvitedToSharedVaultEventHandler)
      .toConstantValue(
        new UserInvitedToSharedVaultEventHandler(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<DomainEventFactoryInterface>(TYPES.Auth_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher),
        ),
      )
    container
      .bind<FileQuotaRecalculatedEventHandler>(TYPES.Auth_FileQuotaRecalculatedEventHandler)
      .toConstantValue(
        new FileQuotaRecalculatedEventHandler(
          container.get<UpdateStorageQuotaUsedForUser>(TYPES.Auth_UpdateStorageQuotaUsedForUser),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )
    container
      .bind<SubscriptionStateFetchedEventHandler>(TYPES.Auth_SubscriptionStateFetchedEventHandler)
      .toConstantValue(
        new SubscriptionStateFetchedEventHandler(
          container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository),
          container.get<UserSubscriptionRepositoryInterface>(TYPES.Auth_UserSubscriptionRepository),
          container.get<OfflineUserSubscriptionRepositoryInterface>(TYPES.Auth_OfflineUserSubscriptionRepository),
          container.get<winston.Logger>(TYPES.Auth_Logger),
        ),
      )

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.Auth_AccountDeletionRequestedEventHandler)],
      ['ACCOUNT_DELETION_VERIFICATION_PASSED', container.get(TYPES.Auth_AccountDeletionVerificationPassedEventHandler)],
      ['SUBSCRIPTION_PURCHASED', container.get(TYPES.Auth_SubscriptionPurchasedEventHandler)],
      ['SUBSCRIPTION_CANCELLED', container.get(TYPES.Auth_SubscriptionCancelledEventHandler)],
      ['SUBSCRIPTION_RENEWED', container.get(TYPES.Auth_SubscriptionRenewedEventHandler)],
      ['SUBSCRIPTION_REFUNDED', container.get(TYPES.Auth_SubscriptionRefundedEventHandler)],
      ['SUBSCRIPTION_EXPIRED', container.get(TYPES.Auth_SubscriptionExpiredEventHandler)],
      ['SUBSCRIPTION_SYNC_REQUESTED', container.get(TYPES.Auth_SubscriptionSyncRequestedEventHandler)],
      ['EXTENSION_KEY_GRANTED', container.get(TYPES.Auth_ExtensionKeyGrantedEventHandler)],
      ['SUBSCRIPTION_REASSIGNED', container.get(TYPES.Auth_SubscriptionReassignedEventHandler)],
      ['FILE_UPLOADED', container.get(TYPES.Auth_FileUploadedEventHandler)],
      ['SHARED_VAULT_FILE_UPLOADED', container.get(TYPES.Auth_SharedVaultFileUploadedEventHandler)],
      ['SHARED_VAULT_FILE_MOVED', container.get(TYPES.Auth_SharedVaultFileMovedEventHandler)],
      ['FILE_REMOVED', container.get(TYPES.Auth_FileRemovedEventHandler)],
      ['SHARED_VAULT_FILE_REMOVED', container.get(TYPES.Auth_SharedVaultFileRemovedEventHandler)],
      ['LISTED_ACCOUNT_CREATED', container.get(TYPES.Auth_ListedAccountCreatedEventHandler)],
      ['LISTED_ACCOUNT_DELETED', container.get(TYPES.Auth_ListedAccountDeletedEventHandler)],
      [
        'USER_DISABLED_SESSION_USER_AGENT_LOGGING',
        container.get(TYPES.Auth_UserDisabledSessionUserAgentLoggingEventHandler),
      ],
      [
        'SHARED_SUBSCRIPTION_INVITATION_CREATED',
        container.get(TYPES.Auth_SharedSubscriptionInvitationCreatedEventHandler),
      ],
      ['PREDICATE_VERIFICATION_REQUESTED', container.get(TYPES.Auth_PredicateVerificationRequestedEventHandler)],
      ['EMAIL_SUBSCRIPTION_UNSUBSCRIBED', container.get(TYPES.Auth_EmailSubscriptionUnsubscribedEventHandler)],
      ['PAYMENTS_ACCOUNT_DELETED', container.get(TYPES.Auth_PaymentsAccountDeletedEventHandler)],
      ['USER_ADDED_TO_SHARED_VAULT', container.get(TYPES.Auth_UserAddedToSharedVaultEventHandler)],
      ['USER_REMOVED_FROM_SHARED_VAULT', container.get(TYPES.Auth_UserRemovedFromSharedVaultEventHandler)],
      [
        'USER_DESIGNATED_AS_SURVIVOR_IN_SHARED_VAULT',
        container.get(TYPES.Auth_UserDesignatedAsSurvivorInSharedVaultEventHandler),
      ],
      ['USER_INVITED_TO_SHARED_VAULT', container.get(TYPES.Auth_UserInvitedToSharedVaultEventHandler)],
      [
        'FILE_QUOTA_RECALCULATED',
        container.get<FileQuotaRecalculatedEventHandler>(TYPES.Auth_FileQuotaRecalculatedEventHandler),
      ],
      ['SUBSCRIPTION_STATE_FETCHED', container.get(TYPES.Auth_SubscriptionStateFetchedEventHandler)],
    ])

    if (isConfiguredForHomeServer) {
      const directCallEventMessageHandler = new DirectCallEventMessageHandler(
        eventHandlers,
        container.get(TYPES.Auth_Logger),
      )
      directCallDomainEventPublisher.register(directCallEventMessageHandler)
      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.Auth_DomainEventMessageHandler)
        .toConstantValue(directCallEventMessageHandler)
    } else {
      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.Auth_DomainEventMessageHandler)
        .toConstantValue(new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Auth_Logger)))

      container
        .bind<DomainEventSubscriberInterface>(TYPES.Auth_DomainEventSubscriber)
        .toConstantValue(
          new SQSDomainEventSubscriber(
            container.get<SQSClient>(TYPES.Auth_SQS),
            container.get<string>(TYPES.Auth_SQS_QUEUE_URL),
            container.get<DomainEventMessageHandlerInterface>(TYPES.Auth_DomainEventMessageHandler),
            container.get<winston.Logger>(TYPES.Auth_Logger),
          ),
        )
    }

    container
      .bind<BaseAuthController>(TYPES.Auth_BaseAuthController)
      .toConstantValue(
        new BaseAuthController(
          container.get(TYPES.Auth_VerifyMFA),
          container.get(TYPES.Auth_SignIn),
          container.get(TYPES.Auth_GetUserKeyParams),
          container.get(TYPES.Auth_ClearLoginAttempts),
          container.get(TYPES.Auth_IncreaseLoginAttempts),
          container.get(TYPES.Auth_Logger),
          container.get(TYPES.Auth_AuthController),
          container.get(TYPES.Auth_ControllerContainer),
        ),
      )

    // Inversify Controllers
    if (isConfiguredForHomeServer) {
      container
        .bind<BaseAuthenticatorsController>(TYPES.Auth_BaseAuthenticatorsController)
        .toConstantValue(
          new BaseAuthenticatorsController(
            container.get(TYPES.Auth_AuthenticatorsController),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseSubscriptionInvitesController>(TYPES.Auth_BaseSubscriptionInvitesController)
        .toConstantValue(
          new BaseSubscriptionInvitesController(
            container.get(TYPES.Auth_SubscriptionInvitesController),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseUserRequestsController>(TYPES.Auth_BaseUserRequestsController)
        .toConstantValue(
          new BaseUserRequestsController(
            container.get(TYPES.Auth_UserRequestsController),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseWebSocketsController>(TYPES.Auth_BaseWebSocketsController)
        .toConstantValue(
          new BaseWebSocketsController(
            container.get(TYPES.Auth_CreateCrossServiceToken),
            container.get(TYPES.Auth_WebSocketConnectionTokenDecoder),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseSessionsController>(TYPES.Auth_BaseSessionsController)
        .toConstantValue(
          new BaseSessionsController(
            container.get(TYPES.Auth_GetActiveSessionsForUser),
            container.get(TYPES.Auth_AuthenticateRequest),
            container.get(TYPES.Auth_SessionProjector),
            container.get(TYPES.Auth_CreateCrossServiceToken),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseValetTokenController>(TYPES.Auth_BaseValetTokenController)
        .toConstantValue(
          new BaseValetTokenController(
            container.get(TYPES.Auth_CreateValetToken),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseUsersController>(TYPES.Auth_BaseUsersController)
        .toConstantValue(
          new BaseUsersController(
            container.get<DeleteAccount>(TYPES.Auth_DeleteAccount),
            container.get<GetUserSubscription>(TYPES.Auth_GetUserSubscription),
            container.get<ClearLoginAttempts>(TYPES.Auth_ClearLoginAttempts),
            container.get<IncreaseLoginAttempts>(TYPES.Auth_IncreaseLoginAttempts),
            container.get<ChangeCredentials>(TYPES.Auth_ChangeCredentials),
            container.get<ControllerContainerInterface>(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseAdminController>(TYPES.Auth_BaseAdminController)
        .toConstantValue(
          new BaseAdminController(
            container.get(TYPES.Auth_DeleteSetting),
            container.get(TYPES.Auth_UserRepository),
            container.get(TYPES.Auth_CreateSubscriptionToken),
            container.get(TYPES.Auth_CreateOfflineSubscriptionToken),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseSubscriptionTokensController>(TYPES.Auth_BaseSubscriptionTokensController)
        .toConstantValue(
          new BaseSubscriptionTokensController(
            container.get<CreateSubscriptionToken>(TYPES.Auth_CreateSubscriptionToken),
            container.get<AuthenticateSubscriptionToken>(TYPES.Auth_AuthenticateSubscriptionToken),
            container.get<GetSetting>(TYPES.Auth_GetSetting),
            container.get<ProjectorInterface<User>>(TYPES.Auth_UserProjector),
            container.get<ProjectorInterface<Role>>(TYPES.Auth_RoleProjector),
            container.get<TokenEncoderInterface<CrossServiceTokenData>>(TYPES.Auth_CrossServiceTokenEncoder),
            container.get<number>(TYPES.Auth_AUTH_JWT_TTL),
            container.get<ControllerContainerInterface>(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseSubscriptionSettingsController>(TYPES.Auth_BaseSubscriptionSettingsController)
        .toConstantValue(
          new BaseSubscriptionSettingsController(
            container.get<GetSubscriptionSetting>(TYPES.Auth_GetSubscriptionSetting),
            container.get<GetSharedOrRegularSubscriptionForUser>(TYPES.Auth_GetSharedOrRegularSubscriptionForUser),
            container.get<MapperInterface<SubscriptionSetting, SubscriptionSettingHttpRepresentation>>(
              TYPES.Auth_SubscriptionSettingHttpMapper,
            ),
            container.get<ControllerContainerInterface>(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseSettingsController>(TYPES.Auth_BaseSettingsController)
        .toConstantValue(
          new BaseSettingsController(
            container.get<GetAllSettingsForUser>(TYPES.Auth_GetAllSettingsForUser),
            container.get<GetSetting>(TYPES.Auth_GetSetting),
            container.get<SetSettingValue>(TYPES.Auth_SetSettingValue),
            container.get<TriggerPostSettingUpdateActions>(TYPES.Auth_TriggerPostSettingUpdateActions),
            container.get<DeleteSetting>(TYPES.Auth_DeleteSetting),
            container.get<MapperInterface<Setting, SettingHttpRepresentation>>(TYPES.Auth_SettingHttpMapper),
            container.get<MapperInterface<SubscriptionSetting, SubscriptionSettingHttpRepresentation>>(
              TYPES.Auth_SubscriptionSettingHttpMapper,
            ),
            container.get<winston.Logger>(TYPES.Auth_Logger),
            container.get<ControllerContainerInterface>(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseSessionController>(TYPES.Auth_BaseSessionController)
        .toConstantValue(
          new BaseSessionController(
            container.get(TYPES.Auth_DeleteSessionForUser),
            container.get(TYPES.Auth_DeleteOtherSessionsForUser),
            container.get(TYPES.Auth_RefreshSessionToken),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseOfflineController>(TYPES.Auth_BaseOfflineController)
        .toConstantValue(
          new BaseOfflineController(
            container.get(TYPES.Auth_GetUserFeatures),
            container.get(TYPES.Auth_GetUserOfflineSubscription),
            container.get(TYPES.Auth_CreateOfflineSubscriptionToken),
            container.get(TYPES.Auth_AuthenticateOfflineSubscriptionToken),
            container.get(TYPES.Auth_OfflineUserTokenEncoder),
            container.get(TYPES.Auth_AUTH_JWT_TTL),
            container.get(TYPES.Auth_Logger),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseListedController>(TYPES.Auth_BaseListedController)
        .toConstantValue(
          new BaseListedController(
            container.get(TYPES.Auth_CreateListedAccount),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<BaseFeaturesController>(TYPES.Auth_BaseFeaturesController)
        .toConstantValue(
          new BaseFeaturesController(
            container.get(TYPES.Auth_GetUserFeatures),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
    }

    logger.debug('Configuration complete')

    return container
  }
}
