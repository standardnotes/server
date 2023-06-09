import * as winston from 'winston'
import Redis from 'ioredis'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { Container } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventPublisherInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import { TimerInterface, Timer } from '@standardnotes/time'
import { UAParser } from 'ua-parser-js'

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
import { DeletePreviousSessionsForUser } from '../Domain/UseCase/DeletePreviousSessionsForUser'
import { DeleteSessionForUser } from '../Domain/UseCase/DeleteSessionForUser'
import { Register } from '../Domain/UseCase/Register'
import { LockRepository } from '../Infra/Redis/LockRepository'
import { TypeORMRevokedSessionRepository } from '../Infra/TypeORM/TypeORMRevokedSessionRepository'
import { AuthenticationMethodResolver } from '../Domain/Auth/AuthenticationMethodResolver'
import { RevokedSession } from '../Domain/Session/RevokedSession'
import { UserRegisteredEventHandler } from '../Domain/Handler/UserRegisteredEventHandler'
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
import { GetSettings } from '../Domain/UseCase/GetSettings/GetSettings'
import { SettingProjector } from '../Projection/SettingProjector'
import { GetSetting } from '../Domain/UseCase/GetSetting/GetSetting'
import { UpdateSetting } from '../Domain/UseCase/UpdateSetting/UpdateSetting'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { SubscriptionPurchasedEventHandler } from '../Domain/Handler/SubscriptionPurchasedEventHandler'
import { SubscriptionRenewedEventHandler } from '../Domain/Handler/SubscriptionRenewedEventHandler'
import { SubscriptionRefundedEventHandler } from '../Domain/Handler/SubscriptionRefundedEventHandler'
import { SubscriptionExpiredEventHandler } from '../Domain/Handler/SubscriptionExpiredEventHandler'
import { DeleteAccount } from '../Domain/UseCase/DeleteAccount/DeleteAccount'
import { DeleteSetting } from '../Domain/UseCase/DeleteSetting/DeleteSetting'
import { SettingFactory } from '../Domain/Setting/SettingFactory'
import { SettingService } from '../Domain/Setting/SettingService'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios')
import { AxiosInstance } from 'axios'
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
import { SettingServiceInterface } from '../Domain/Setting/SettingServiceInterface'
import { ExtensionKeyGrantedEventHandler } from '../Domain/Handler/ExtensionKeyGrantedEventHandler'
import {
  DirectCallDomainEventPublisher,
  DirectCallEventMessageHandler,
  SNSDomainEventPublisher,
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
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
import { UserEmailChangedEventHandler } from '../Domain/Handler/UserEmailChangedEventHandler'
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
import { SettingInterpreterInterface } from '../Domain/Setting/SettingInterpreterInterface'
import { SettingInterpreter } from '../Domain/Setting/SettingInterpreter'
import { SettingDecrypterInterface } from '../Domain/Setting/SettingDecrypterInterface'
import { SettingDecrypter } from '../Domain/Setting/SettingDecrypter'
import { SharedSubscriptionInvitationRepositoryInterface } from '../Domain/SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'
import { TypeORMSharedSubscriptionInvitationRepository } from '../Infra/TypeORM/TypeORMSharedSubscriptionInvitationRepository'
import { InviteToSharedSubscription } from '../Domain/UseCase/InviteToSharedSubscription/InviteToSharedSubscription'
import { SharedSubscriptionInvitation } from '../Domain/SharedSubscription/SharedSubscriptionInvitation'
import { AcceptSharedSubscriptionInvitation } from '../Domain/UseCase/AcceptSharedSubscriptionInvitation/AcceptSharedSubscriptionInvitation'
import { DeclineSharedSubscriptionInvitation } from '../Domain/UseCase/DeclineSharedSubscriptionInvitation/DeclineSharedSubscriptionInvitation'
import { CancelSharedSubscriptionInvitation } from '../Domain/UseCase/CancelSharedSubscriptionInvitation/CancelSharedSubscriptionInvitation'
import { SharedSubscriptionInvitationCreatedEventHandler } from '../Domain/Handler/SharedSubscriptionInvitationCreatedEventHandler'
import { SubscriptionSetting } from '../Domain/Setting/SubscriptionSetting'
import { SubscriptionSettingServiceInterface } from '../Domain/Setting/SubscriptionSettingServiceInterface'
import { SubscriptionSettingService } from '../Domain/Setting/SubscriptionSettingService'
import { SubscriptionSettingRepositoryInterface } from '../Domain/Setting/SubscriptionSettingRepositoryInterface'
import { TypeORMSubscriptionSettingRepository } from '../Infra/TypeORM/TypeORMSubscriptionSettingRepository'
import { SettingFactoryInterface } from '../Domain/Setting/SettingFactoryInterface'
import { ListSharedSubscriptionInvitations } from '../Domain/UseCase/ListSharedSubscriptionInvitations/ListSharedSubscriptionInvitations'
import { UserSubscriptionServiceInterface } from '../Domain/Subscription/UserSubscriptionServiceInterface'
import { UserSubscriptionService } from '../Domain/Subscription/UserSubscriptionService'
import { SubscriptionSettingProjector } from '../Projection/SubscriptionSettingProjector'
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
import { HomeServerSettingsController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerSettingsController'
import { HomeServerAdminController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerAdminController'
import { HomeServerAuthController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerAuthController'
import { HomeServerAuthenticatorsController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerAuthenticatorsController'
import { HomeServerFeaturesController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerFeaturesController'
import { HomeServerListedController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerListedController'
import { HomeServerOfflineController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerOfflineController'
import { HomeServerSessionController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerSessionController'
import { HomeServerSubscriptionInvitesController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerSubscriptionInvitesController'
import { HomeServerSubscriptionSettingsController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerSubscriptionSettingsController'
import { HomeServerSubscriptionTokensController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerSubscriptionTokensController'
import { HomeServerUserRequestsController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerUserRequestsController'
import { HomeServerUsersController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerUsersController'
import { HomeServerValetTokenController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerValetTokenController'
import { HomeServerWebSocketsController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerWebSocketsController'
import { HomeServerSessionsController } from '../Infra/InversifyExpressUtils/HomeServer/HomeServerSessionsController'
import { Transform } from 'stream'
import { ActivatePremiumFeatures } from '../Domain/UseCase/ActivatePremiumFeatures/ActivatePremiumFeatures'

export class ContainerConfigLoader {
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

    const appDataSource = new AppDataSource(env)
    await appDataSource.initialize()

    const isConfiguredForHomeServer = env.get('MODE', true) === 'home-server'
    const isConfiguredForInMemoryCache = env.get('CACHE_TYPE', true) === 'memory'

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

    const winstonFormatters = [winston.format.splat(), winston.format.json()]
    if (env.get('NEW_RELIC_ENABLED', true) === 'true') {
      await import('newrelic')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const newrelicFormatter = require('@newrelic/winston-enricher')
      const newrelicWinstonFormatter = newrelicFormatter(winston)
      winstonFormatters.push(newrelicWinstonFormatter())
    }

    if (configuration?.logger) {
      container.bind<winston.Logger>(TYPES.Auth_Logger).toConstantValue(configuration.logger as winston.Logger)
    } else {
      const logger = winston.createLogger({
        level: env.get('LOG_LEVEL', true) || 'info',
        format: winston.format.combine(...winstonFormatters),
        transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL', true) || 'info' })],
        defaultMeta: { service: 'auth' },
      })
      container.bind<winston.Logger>(TYPES.Auth_Logger).toConstantValue(logger)
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
      container.bind<SNSClient>(TYPES.Auth_SNS).toConstantValue(new SNSClient(snsConfig))

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
      container.bind<SQSClient>(TYPES.Auth_SQS).toConstantValue(new SQSClient(sqsConfig))
    }

    // Mapping
    container
      .bind<MapperInterface<SessionTrace, TypeORMSessionTrace>>(TYPES.Auth_SessionTracePersistenceMapper)
      .toConstantValue(new SessionTracePersistenceMapper())
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
      .bind<Repository<Setting>>(TYPES.Auth_ORMSettingRepository)
      .toConstantValue(appDataSource.getRepository(Setting))
    container
      .bind<Repository<SharedSubscriptionInvitation>>(TYPES.Auth_ORMSharedSubscriptionInvitationRepository)
      .toConstantValue(appDataSource.getRepository(SharedSubscriptionInvitation))
    container
      .bind<Repository<SubscriptionSetting>>(TYPES.Auth_ORMSubscriptionSettingRepository)
      .toConstantValue(appDataSource.getRepository(SubscriptionSetting))
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

    // Repositories
    container.bind<SessionRepositoryInterface>(TYPES.Auth_SessionRepository).to(TypeORMSessionRepository)
    container
      .bind<RevokedSessionRepositoryInterface>(TYPES.Auth_RevokedSessionRepository)
      .to(TypeORMRevokedSessionRepository)
    container.bind<UserRepositoryInterface>(TYPES.Auth_UserRepository).to(TypeORMUserRepository)
    container.bind<SettingRepositoryInterface>(TYPES.Auth_SettingRepository).to(TypeORMSettingRepository)
    container
      .bind<SubscriptionSettingRepositoryInterface>(TYPES.Auth_SubscriptionSettingRepository)
      .to(TypeORMSubscriptionSettingRepository)
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
          container.get(TYPES.Auth_ORMSessionTraceRepository),
          container.get(TYPES.Auth_SessionTracePersistenceMapper),
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

    // Middleware
    container.bind<SessionMiddleware>(TYPES.Auth_SessionMiddleware).to(SessionMiddleware)
    container.bind<LockMiddleware>(TYPES.Auth_LockMiddleware).to(LockMiddleware)
    container
      .bind<RequiredCrossServiceTokenMiddleware>(TYPES.Auth_RequiredCrossServiceTokenMiddleware)
      .to(RequiredCrossServiceTokenMiddleware)
    container
      .bind<OptionalCrossServiceTokenMiddleware>(TYPES.Auth_OptionalCrossServiceTokenMiddleware)
      .to(OptionalCrossServiceTokenMiddleware)
    container
      .bind<ApiGatewayOfflineAuthMiddleware>(TYPES.Auth_ApiGatewayOfflineAuthMiddleware)
      .to(ApiGatewayOfflineAuthMiddleware)
    container.bind<OfflineUserAuthMiddleware>(TYPES.Auth_OfflineUserAuthMiddleware).to(OfflineUserAuthMiddleware)

    // Projectors
    container.bind<SessionProjector>(TYPES.Auth_SessionProjector).to(SessionProjector)
    container.bind<UserProjector>(TYPES.Auth_UserProjector).to(UserProjector)
    container.bind<RoleProjector>(TYPES.Auth_RoleProjector).to(RoleProjector)
    container.bind<PermissionProjector>(TYPES.Auth_PermissionProjector).to(PermissionProjector)
    container.bind<SettingProjector>(TYPES.Auth_SettingProjector).to(SettingProjector)
    container
      .bind<SubscriptionSettingProjector>(TYPES.Auth_SubscriptionSettingProjector)
      .to(SubscriptionSettingProjector)

    // Factories
    container.bind<SettingFactoryInterface>(TYPES.Auth_SettingFactory).to(SettingFactory)

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
    container.bind(TYPES.Auth_SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN', true))
    container.bind(TYPES.Auth_SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
    container.bind(TYPES.Auth_SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL', true))
    container
      .bind(TYPES.Auth_USER_SERVER_REGISTRATION_URL)
      .toConstantValue(env.get('USER_SERVER_REGISTRATION_URL', true))
    container.bind(TYPES.Auth_USER_SERVER_AUTH_KEY).toConstantValue(env.get('USER_SERVER_AUTH_KEY', true))
    container
      .bind(TYPES.Auth_USER_SERVER_CHANGE_EMAIL_URL)
      .toConstantValue(env.get('USER_SERVER_CHANGE_EMAIL_URL', true))
    container.bind(TYPES.Auth_NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.Auth_SYNCING_SERVER_URL).toConstantValue(env.get('SYNCING_SERVER_URL', true))
    container.bind(TYPES.Auth_VERSION).toConstantValue(env.get('VERSION', true) ?? 'development')
    container.bind(TYPES.Auth_PAYMENTS_SERVER_URL).toConstantValue(env.get('PAYMENTS_SERVER_URL', true))
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

    // Services
    container.bind<UAParser>(TYPES.Auth_DeviceDetector).toConstantValue(new UAParser())
    container.bind<SessionService>(TYPES.Auth_SessionService).to(SessionService)
    container.bind<AuthResponseFactory20161215>(TYPES.Auth_AuthResponseFactory20161215).to(AuthResponseFactory20161215)
    container.bind<AuthResponseFactory20190520>(TYPES.Auth_AuthResponseFactory20190520).to(AuthResponseFactory20190520)
    container.bind<AuthResponseFactory20200115>(TYPES.Auth_AuthResponseFactory20200115).to(AuthResponseFactory20200115)
    container.bind<AuthResponseFactoryResolver>(TYPES.Auth_AuthResponseFactoryResolver).to(AuthResponseFactoryResolver)
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
    container.bind<AxiosInstance>(TYPES.Auth_HTTPClient).toConstantValue(axios.create())
    container.bind<CrypterInterface>(TYPES.Auth_Crypter).to(CrypterNode)
    container.bind<SettingServiceInterface>(TYPES.Auth_SettingService).to(SettingService)
    container
      .bind<SubscriptionSettingServiceInterface>(TYPES.Auth_SubscriptionSettingService)
      .to(SubscriptionSettingService)
    container.bind<OfflineSettingServiceInterface>(TYPES.Auth_OfflineSettingService).to(OfflineSettingService)
    container.bind<CryptoNode>(TYPES.Auth_CryptoNode).toConstantValue(new CryptoNode())
    container.bind<ContentDecoderInterface>(TYPES.Auth_ContenDecoder).toConstantValue(new ContentDecoder())
    container.bind<ClientServiceInterface>(TYPES.Auth_WebSocketsClientService).to(WebSocketsClientService)
    container.bind<RoleServiceInterface>(TYPES.Auth_RoleService).to(RoleService)
    container.bind<RoleToSubscriptionMapInterface>(TYPES.Auth_RoleToSubscriptionMap).to(RoleToSubscriptionMap)
    container
      .bind<SettingsAssociationServiceInterface>(TYPES.Auth_SettingsAssociationService)
      .to(SettingsAssociationService)
    container
      .bind<SubscriptionSettingsAssociationServiceInterface>(TYPES.Auth_SubscriptionSettingsAssociationService)
      .to(SubscriptionSettingsAssociationService)
    container.bind<FeatureServiceInterface>(TYPES.Auth_FeatureService).to(FeatureService)
    container.bind<SettingInterpreterInterface>(TYPES.Auth_SettingInterpreter).to(SettingInterpreter)
    container.bind<SettingDecrypterInterface>(TYPES.Auth_SettingDecrypter).to(SettingDecrypter)
    container
      .bind<SelectorInterface<ProtocolVersion>>(TYPES.Auth_ProtocolVersionSelector)
      .toConstantValue(new DeterministicSelector<ProtocolVersion>())
    container
      .bind<SelectorInterface<boolean>>(TYPES.Auth_BooleanSelector)
      .toConstantValue(new DeterministicSelector<boolean>())
    container.bind<UserSubscriptionServiceInterface>(TYPES.Auth_UserSubscriptionService).to(UserSubscriptionService)

    container
      .bind<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher)
      .toConstantValue(
        isConfiguredForHomeServer
          ? directCallDomainEventPublisher
          : new SNSDomainEventPublisher(container.get(TYPES.Auth_SNS), container.get(TYPES.Auth_SNS_TOPIC_ARN)),
      )

    // use cases
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
      .bind<GenerateRecoveryCodes>(TYPES.Auth_GenerateRecoveryCodes)
      .toConstantValue(
        new GenerateRecoveryCodes(
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_SettingService),
          container.get(TYPES.Auth_CryptoNode),
        ),
      )
    container
      .bind<ActivatePremiumFeatures>(TYPES.Auth_ActivatePremiumFeatures)
      .toConstantValue(
        new ActivatePremiumFeatures(
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_UserSubscriptionRepository),
          container.get(TYPES.Auth_RoleService),
          container.get(TYPES.Auth_Timer),
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
    container.bind<RefreshSessionToken>(TYPES.Auth_RefreshSessionToken).to(RefreshSessionToken)
    container.bind<SignIn>(TYPES.Auth_SignIn).to(SignIn)
    container.bind<VerifyMFA>(TYPES.Auth_VerifyMFA).to(VerifyMFA)
    container.bind<ClearLoginAttempts>(TYPES.Auth_ClearLoginAttempts).to(ClearLoginAttempts)
    container.bind<IncreaseLoginAttempts>(TYPES.Auth_IncreaseLoginAttempts).to(IncreaseLoginAttempts)
    container
      .bind<GetUserKeyParamsRecovery>(TYPES.Auth_GetUserKeyParamsRecovery)
      .toConstantValue(
        new GetUserKeyParamsRecovery(
          container.get(TYPES.Auth_KeyParamsFactory),
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_PKCERepository),
          container.get(TYPES.Auth_SettingService),
        ),
      )
    container.bind<GetUserKeyParams>(TYPES.Auth_GetUserKeyParams).to(GetUserKeyParams)
    container.bind<UpdateUser>(TYPES.Auth_UpdateUser).to(UpdateUser)
    container.bind<Register>(TYPES.Auth_Register).to(Register)
    container.bind<GetActiveSessionsForUser>(TYPES.Auth_GetActiveSessionsForUser).to(GetActiveSessionsForUser)
    container
      .bind<DeletePreviousSessionsForUser>(TYPES.Auth_DeletePreviousSessionsForUser)
      .to(DeletePreviousSessionsForUser)
    container.bind<DeleteSessionForUser>(TYPES.Auth_DeleteSessionForUser).to(DeleteSessionForUser)
    container.bind<ChangeCredentials>(TYPES.Auth_ChangeCredentials).to(ChangeCredentials)
    container.bind<GetSettings>(TYPES.Auth_GetSettings).to(GetSettings)
    container.bind<GetSetting>(TYPES.Auth_GetSetting).to(GetSetting)
    container.bind<GetUserFeatures>(TYPES.Auth_GetUserFeatures).to(GetUserFeatures)
    container.bind<UpdateSetting>(TYPES.Auth_UpdateSetting).to(UpdateSetting)
    container.bind<DeleteSetting>(TYPES.Auth_DeleteSetting).to(DeleteSetting)
    container
      .bind<SignInWithRecoveryCodes>(TYPES.Auth_SignInWithRecoveryCodes)
      .toConstantValue(
        new SignInWithRecoveryCodes(
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_AuthResponseFactory20200115),
          container.get(TYPES.Auth_PKCERepository),
          container.get(TYPES.Auth_Crypter),
          container.get(TYPES.Auth_SettingService),
          container.get(TYPES.Auth_GenerateRecoveryCodes),
          container.get(TYPES.Auth_IncreaseLoginAttempts),
          container.get(TYPES.Auth_ClearLoginAttempts),
          container.get(TYPES.Auth_DeleteSetting),
          container.get(TYPES.Auth_AuthenticatorRepository),
        ),
      )
    container.bind<DeleteAccount>(TYPES.Auth_DeleteAccount).to(DeleteAccount)
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
    container.bind<CreateValetToken>(TYPES.Auth_CreateValetToken).to(CreateValetToken)
    container.bind<CreateListedAccount>(TYPES.Auth_CreateListedAccount).to(CreateListedAccount)
    container.bind<InviteToSharedSubscription>(TYPES.Auth_InviteToSharedSubscription).to(InviteToSharedSubscription)
    container
      .bind<AcceptSharedSubscriptionInvitation>(TYPES.Auth_AcceptSharedSubscriptionInvitation)
      .to(AcceptSharedSubscriptionInvitation)
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
    container.bind<CreateCrossServiceToken>(TYPES.Auth_CreateCrossServiceToken).to(CreateCrossServiceToken)
    container.bind<ProcessUserRequest>(TYPES.Auth_ProcessUserRequest).to(ProcessUserRequest)

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
    container.bind<UserRegisteredEventHandler>(TYPES.Auth_UserRegisteredEventHandler).to(UserRegisteredEventHandler)
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.Auth_AccountDeletionRequestedEventHandler)
      .to(AccountDeletionRequestedEventHandler)
    container
      .bind<SubscriptionPurchasedEventHandler>(TYPES.Auth_SubscriptionPurchasedEventHandler)
      .to(SubscriptionPurchasedEventHandler)
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
      .to(SubscriptionSyncRequestedEventHandler)
    container
      .bind<ExtensionKeyGrantedEventHandler>(TYPES.Auth_ExtensionKeyGrantedEventHandler)
      .to(ExtensionKeyGrantedEventHandler)
    container
      .bind<SubscriptionReassignedEventHandler>(TYPES.Auth_SubscriptionReassignedEventHandler)
      .to(SubscriptionReassignedEventHandler)
    container
      .bind<UserEmailChangedEventHandler>(TYPES.Auth_UserEmailChangedEventHandler)
      .to(UserEmailChangedEventHandler)
    container.bind<FileUploadedEventHandler>(TYPES.Auth_FileUploadedEventHandler).to(FileUploadedEventHandler)
    container.bind<FileRemovedEventHandler>(TYPES.Auth_FileRemovedEventHandler).to(FileRemovedEventHandler)
    container
      .bind<ListedAccountCreatedEventHandler>(TYPES.Auth_ListedAccountCreatedEventHandler)
      .to(ListedAccountCreatedEventHandler)
    container
      .bind<ListedAccountDeletedEventHandler>(TYPES.Auth_ListedAccountDeletedEventHandler)
      .to(ListedAccountDeletedEventHandler)
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
          container.get(TYPES.Auth_UserRepository),
          container.get(TYPES.Auth_SettingService),
        ),
      )

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['USER_REGISTERED', container.get(TYPES.Auth_UserRegisteredEventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.Auth_AccountDeletionRequestedEventHandler)],
      ['SUBSCRIPTION_PURCHASED', container.get(TYPES.Auth_SubscriptionPurchasedEventHandler)],
      ['SUBSCRIPTION_CANCELLED', container.get(TYPES.Auth_SubscriptionCancelledEventHandler)],
      ['SUBSCRIPTION_RENEWED', container.get(TYPES.Auth_SubscriptionRenewedEventHandler)],
      ['SUBSCRIPTION_REFUNDED', container.get(TYPES.Auth_SubscriptionRefundedEventHandler)],
      ['SUBSCRIPTION_EXPIRED', container.get(TYPES.Auth_SubscriptionExpiredEventHandler)],
      ['SUBSCRIPTION_SYNC_REQUESTED', container.get(TYPES.Auth_SubscriptionSyncRequestedEventHandler)],
      ['EXTENSION_KEY_GRANTED', container.get(TYPES.Auth_ExtensionKeyGrantedEventHandler)],
      ['SUBSCRIPTION_REASSIGNED', container.get(TYPES.Auth_SubscriptionReassignedEventHandler)],
      ['USER_EMAIL_CHANGED', container.get(TYPES.Auth_UserEmailChangedEventHandler)],
      ['FILE_UPLOADED', container.get(TYPES.Auth_FileUploadedEventHandler)],
      ['FILE_REMOVED', container.get(TYPES.Auth_FileRemovedEventHandler)],
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
        .toConstantValue(
          env.get('NEW_RELIC_ENABLED', true) === 'true'
            ? new SQSNewRelicEventMessageHandler(eventHandlers, container.get(TYPES.Auth_Logger))
            : new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Auth_Logger)),
        )

      container
        .bind<DomainEventSubscriberFactoryInterface>(TYPES.Auth_DomainEventSubscriberFactory)
        .toConstantValue(
          new SQSDomainEventSubscriberFactory(
            container.get(TYPES.Auth_SQS),
            container.get(TYPES.Auth_SQS_QUEUE_URL),
            container.get(TYPES.Auth_DomainEventMessageHandler),
          ),
        )
    }

    container
      .bind<HomeServerAuthController>(TYPES.Auth_HomeServerAuthController)
      .toConstantValue(
        new HomeServerAuthController(
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
        .bind<HomeServerAuthenticatorsController>(TYPES.Auth_HomeServerAuthenticatorsController)
        .toConstantValue(
          new HomeServerAuthenticatorsController(
            container.get(TYPES.Auth_AuthenticatorsController),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerSubscriptionInvitesController>(TYPES.Auth_HomeServerSubscriptionInvitesController)
        .toConstantValue(
          new HomeServerSubscriptionInvitesController(
            container.get(TYPES.Auth_SubscriptionInvitesController),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerUserRequestsController>(TYPES.Auth_HomeServerUserRequestsController)
        .toConstantValue(
          new HomeServerUserRequestsController(
            container.get(TYPES.Auth_UserRequestsController),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerWebSocketsController>(TYPES.Auth_HomeServerWebSocketsController)
        .toConstantValue(
          new HomeServerWebSocketsController(
            container.get(TYPES.Auth_CreateCrossServiceToken),
            container.get(TYPES.Auth_WebSocketConnectionTokenDecoder),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerSessionsController>(TYPES.Auth_HomeServerSessionsController)
        .toConstantValue(
          new HomeServerSessionsController(
            container.get(TYPES.Auth_GetActiveSessionsForUser),
            container.get(TYPES.Auth_AuthenticateRequest),
            container.get(TYPES.Auth_SessionProjector),
            container.get(TYPES.Auth_CreateCrossServiceToken),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerValetTokenController>(TYPES.Auth_HomeServerValetTokenController)
        .toConstantValue(
          new HomeServerValetTokenController(
            container.get(TYPES.Auth_CreateValetToken),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerUsersController>(TYPES.Auth_HomeServerUsersController)
        .toConstantValue(
          new HomeServerUsersController(
            container.get(TYPES.Auth_UpdateUser),
            container.get(TYPES.Auth_GetUserKeyParams),
            container.get(TYPES.Auth_DeleteAccount),
            container.get(TYPES.Auth_GetUserSubscription),
            container.get(TYPES.Auth_ClearLoginAttempts),
            container.get(TYPES.Auth_IncreaseLoginAttempts),
            container.get(TYPES.Auth_ChangeCredentials),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerAdminController>(TYPES.Auth_HomeServerAdminController)
        .toConstantValue(
          new HomeServerAdminController(
            container.get(TYPES.Auth_DeleteSetting),
            container.get(TYPES.Auth_UserRepository),
            container.get(TYPES.Auth_CreateSubscriptionToken),
            container.get(TYPES.Auth_CreateOfflineSubscriptionToken),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerSubscriptionTokensController>(TYPES.Auth_HomeServerSubscriptionTokensController)
        .toConstantValue(
          new HomeServerSubscriptionTokensController(
            container.get(TYPES.Auth_CreateSubscriptionToken),
            container.get(TYPES.Auth_AuthenticateSubscriptionToken),
            container.get(TYPES.Auth_SettingService),
            container.get(TYPES.Auth_UserProjector),
            container.get(TYPES.Auth_RoleProjector),
            container.get(TYPES.Auth_CrossServiceTokenEncoder),
            container.get(TYPES.Auth_AUTH_JWT_TTL),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerSubscriptionSettingsController>(TYPES.Auth_HomeServerSubscriptionSettingsController)
        .toConstantValue(
          new HomeServerSubscriptionSettingsController(
            container.get(TYPES.Auth_GetSetting),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerSettingsController>(TYPES.Auth_HomeServerSettingsController)
        .toConstantValue(
          new HomeServerSettingsController(
            container.get(TYPES.Auth_GetSettings),
            container.get(TYPES.Auth_GetSetting),
            container.get(TYPES.Auth_UpdateSetting),
            container.get(TYPES.Auth_DeleteSetting),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerSessionController>(TYPES.Auth_HomeServerSessionController)
        .toConstantValue(
          new HomeServerSessionController(
            container.get(TYPES.Auth_DeleteSessionForUser),
            container.get(TYPES.Auth_DeletePreviousSessionsForUser),
            container.get(TYPES.Auth_RefreshSessionToken),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerOfflineController>(TYPES.Auth_HomeServerOfflineController)
        .toConstantValue(
          new HomeServerOfflineController(
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
        .bind<HomeServerListedController>(TYPES.Auth_HomeServerListedController)
        .toConstantValue(
          new HomeServerListedController(
            container.get(TYPES.Auth_CreateListedAccount),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
      container
        .bind<HomeServerFeaturesController>(TYPES.Auth_HomeServerFeaturesController)
        .toConstantValue(
          new HomeServerFeaturesController(
            container.get(TYPES.Auth_GetUserFeatures),
            container.get(TYPES.Auth_ControllerContainer),
          ),
        )
    }

    return container
  }
}
