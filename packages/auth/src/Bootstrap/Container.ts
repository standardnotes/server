import * as winston from 'winston'
import Redis from 'ioredis'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { Container } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import { TimerInterface, Timer } from '@standardnotes/time'
import { UAParser } from 'ua-parser-js'

import { Env } from './Env'
import TYPES from './Types'
import { AuthMiddleware } from '../Controller/AuthMiddleware'
import { AuthenticateUser } from '../Domain/UseCase/AuthenticateUser'
import { Repository } from 'typeorm'
import { AppDataSource } from './DataSource'
import { User } from '../Domain/User/User'
import { Session } from '../Domain/Session/Session'
import { SessionService } from '../Domain/Session/SessionService'
import { TypeORMSessionRepository } from '../Infra/TypeORM/TypeORMSessionRepository'
import { TypeORMUserRepository } from '../Infra/TypeORM/TypeORMUserRepository'
import { SessionProjector } from '../Projection/SessionProjector'
import { SessionMiddleware } from '../Controller/SessionMiddleware'
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
import { LockMiddleware } from '../Controller/LockMiddleware'
import { AuthMiddlewareWithoutResponse } from '../Controller/AuthMiddlewareWithoutResponse'
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
import { ApiGatewayAuthMiddleware } from '../Controller/ApiGatewayAuthMiddleware'
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
import { OfflineUserAuthMiddleware } from '../Controller/OfflineUserAuthMiddleware'
import { OfflineSubscriptionTokenRepositoryInterface } from '../Domain/Auth/OfflineSubscriptionTokenRepositoryInterface'
import { RedisOfflineSubscriptionTokenRepository } from '../Infra/Redis/RedisOfflineSubscriptionTokenRepository'
import { CreateOfflineSubscriptionToken } from '../Domain/UseCase/CreateOfflineSubscriptionToken/CreateOfflineSubscriptionToken'
import { AuthenticateOfflineSubscriptionToken } from '../Domain/UseCase/AuthenticateOfflineSubscriptionToken/AuthenticateOfflineSubscriptionToken'
import { SubscriptionCancelledEventHandler } from '../Domain/Handler/SubscriptionCancelledEventHandler'
import { ContentDecoder, ContentDecoderInterface, ProtocolVersion } from '@standardnotes/common'
import { GetUserOfflineSubscription } from '../Domain/UseCase/GetUserOfflineSubscription/GetUserOfflineSubscription'
import { ApiGatewayOfflineAuthMiddleware } from '../Controller/ApiGatewayOfflineAuthMiddleware'
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
import { MapperInterface } from '@standardnotes/domain-core'
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
import { CacheEntryRepositoryInterface } from '../Domain/Cache/CacheEntryRepositoryInterface'
import { TypeORMCacheEntryRepository } from '../Infra/TypeORM/TypeORMCacheEntryRepository'
import { CacheEntry } from '../Domain/Cache/CacheEntry'
import { CacheEntryPersistenceMapper } from '../Mapping/CacheEntryPersistenceMapper'
import { TypeORMLockRepository } from '../Infra/TypeORM/TypeORMLockRepository'
import { EphemeralSessionRepositoryInterface } from '../Domain/Session/EphemeralSessionRepositoryInterface'
import { TypeORMEphemeralSessionRepository } from '../Infra/TypeORM/TypeORMEphemeralSessionRepository'
import { TypeORMOfflineSubscriptionTokenRepository } from '../Infra/TypeORM/TypeORMOfflineSubscriptionTokenRepository'
import { TypeORMPKCERepository } from '../Infra/TypeORM/TypeORMPKCERepository'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicFormatter = require('@newrelic/winston-enricher')

export class ContainerConfigLoader {
  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

    await AppDataSource.initialize()

    const isConfiguredForHomeServer = env.get('DB_TYPE') === 'sqlite'

    const redisUrl = env.get('REDIS_URL')
    const isRedisInClusterMode = redisUrl.indexOf(',') > 0
    let redis
    if (isRedisInClusterMode) {
      redis = new Redis.Cluster(redisUrl.split(','))
    } else {
      redis = new Redis(redisUrl)
    }

    container.bind(TYPES.Redis).toConstantValue(redis)

    const newrelicWinstonFormatter = newrelicFormatter(winston)
    const winstonFormatters = [winston.format.splat(), winston.format.json()]
    if (env.get('NEW_RELIC_ENABLED', true) === 'true') {
      winstonFormatters.push(newrelicWinstonFormatter())
    }

    const logger = winston.createLogger({
      level: env.get('LOG_LEVEL') || 'info',
      format: winston.format.combine(...winstonFormatters),
      transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' })],
    })
    container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

    container.bind<TimerInterface>(TYPES.Timer).toConstantValue(new Timer())

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
    container.bind<SNSClient>(TYPES.SNS).toConstantValue(new SNSClient(snsConfig))

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
    container.bind<SQSClient>(TYPES.SQS).toConstantValue(new SQSClient(sqsConfig))

    // Mapping
    container
      .bind<MapperInterface<SessionTrace, TypeORMSessionTrace>>(TYPES.SessionTracePersistenceMapper)
      .toConstantValue(new SessionTracePersistenceMapper())
    container
      .bind<MapperInterface<Authenticator, TypeORMAuthenticator>>(TYPES.AuthenticatorPersistenceMapper)
      .toConstantValue(new AuthenticatorPersistenceMapper())
    container
      .bind<MapperInterface<Authenticator, AuthenticatorHttpProjection>>(TYPES.AuthenticatorHttpMapper)
      .toConstantValue(new AuthenticatorHttpMapper())
    container
      .bind<MapperInterface<AuthenticatorChallenge, TypeORMAuthenticatorChallenge>>(
        TYPES.AuthenticatorChallengePersistenceMapper,
      )
      .toConstantValue(new AuthenticatorChallengePersistenceMapper())
    container
      .bind<MapperInterface<CacheEntry, TypeORMCacheEntry>>(TYPES.CacheEntryPersistenceMapper)
      .toConstantValue(new CacheEntryPersistenceMapper())

    // ORM
    container
      .bind<Repository<OfflineSetting>>(TYPES.ORMOfflineSettingRepository)
      .toConstantValue(AppDataSource.getRepository(OfflineSetting))
    container
      .bind<Repository<OfflineUserSubscription>>(TYPES.ORMOfflineUserSubscriptionRepository)
      .toConstantValue(AppDataSource.getRepository(OfflineUserSubscription))
    container
      .bind<Repository<RevokedSession>>(TYPES.ORMRevokedSessionRepository)
      .toConstantValue(AppDataSource.getRepository(RevokedSession))
    container.bind<Repository<Role>>(TYPES.ORMRoleRepository).toConstantValue(AppDataSource.getRepository(Role))
    container
      .bind<Repository<Session>>(TYPES.ORMSessionRepository)
      .toConstantValue(AppDataSource.getRepository(Session))
    container
      .bind<Repository<Setting>>(TYPES.ORMSettingRepository)
      .toConstantValue(AppDataSource.getRepository(Setting))
    container
      .bind<Repository<SharedSubscriptionInvitation>>(TYPES.ORMSharedSubscriptionInvitationRepository)
      .toConstantValue(AppDataSource.getRepository(SharedSubscriptionInvitation))
    container
      .bind<Repository<SubscriptionSetting>>(TYPES.ORMSubscriptionSettingRepository)
      .toConstantValue(AppDataSource.getRepository(SubscriptionSetting))
    container.bind<Repository<User>>(TYPES.ORMUserRepository).toConstantValue(AppDataSource.getRepository(User))
    container
      .bind<Repository<UserSubscription>>(TYPES.ORMUserSubscriptionRepository)
      .toConstantValue(AppDataSource.getRepository(UserSubscription))
    container
      .bind<Repository<TypeORMSessionTrace>>(TYPES.ORMSessionTraceRepository)
      .toConstantValue(AppDataSource.getRepository(TypeORMSessionTrace))
    container
      .bind<Repository<TypeORMAuthenticator>>(TYPES.ORMAuthenticatorRepository)
      .toConstantValue(AppDataSource.getRepository(TypeORMAuthenticator))
    container
      .bind<Repository<TypeORMAuthenticatorChallenge>>(TYPES.ORMAuthenticatorChallengeRepository)
      .toConstantValue(AppDataSource.getRepository(TypeORMAuthenticatorChallenge))
    container
      .bind<Repository<TypeORMCacheEntry>>(TYPES.ORMCacheEntryRepository)
      .toConstantValue(AppDataSource.getRepository(TypeORMCacheEntry))

    // Repositories
    container.bind<SessionRepositoryInterface>(TYPES.SessionRepository).to(TypeORMSessionRepository)
    container
      .bind<RevokedSessionRepositoryInterface>(TYPES.RevokedSessionRepository)
      .to(TypeORMRevokedSessionRepository)
    container.bind<UserRepositoryInterface>(TYPES.UserRepository).to(TypeORMUserRepository)
    container.bind<SettingRepositoryInterface>(TYPES.SettingRepository).to(TypeORMSettingRepository)
    container
      .bind<SubscriptionSettingRepositoryInterface>(TYPES.SubscriptionSettingRepository)
      .to(TypeORMSubscriptionSettingRepository)
    container
      .bind<OfflineSettingRepositoryInterface>(TYPES.OfflineSettingRepository)
      .to(TypeORMOfflineSettingRepository)
    container.bind<RoleRepositoryInterface>(TYPES.RoleRepository).to(TypeORMRoleRepository)
    container
      .bind<UserSubscriptionRepositoryInterface>(TYPES.UserSubscriptionRepository)
      .to(TypeORMUserSubscriptionRepository)
    container
      .bind<OfflineUserSubscriptionRepositoryInterface>(TYPES.OfflineUserSubscriptionRepository)
      .to(TypeORMOfflineUserSubscriptionRepository)
    container
      .bind<SubscriptionTokenRepositoryInterface>(TYPES.SubscriptionTokenRepository)
      .to(RedisSubscriptionTokenRepository)
    container
      .bind<SharedSubscriptionInvitationRepositoryInterface>(TYPES.SharedSubscriptionInvitationRepository)
      .to(TypeORMSharedSubscriptionInvitationRepository)
    container
      .bind<SessionTraceRepositoryInterface>(TYPES.SessionTraceRepository)
      .toConstantValue(
        new TypeORMSessionTraceRepository(
          container.get(TYPES.ORMSessionTraceRepository),
          container.get(TYPES.SessionTracePersistenceMapper),
        ),
      )
    container
      .bind<AuthenticatorRepositoryInterface>(TYPES.AuthenticatorRepository)
      .toConstantValue(
        new TypeORMAuthenticatorRepository(
          container.get(TYPES.ORMAuthenticatorRepository),
          container.get(TYPES.AuthenticatorPersistenceMapper),
        ),
      )
    container
      .bind<AuthenticatorChallengeRepositoryInterface>(TYPES.AuthenticatorChallengeRepository)
      .toConstantValue(
        new TypeORMAuthenticatorChallengeRepository(
          container.get(TYPES.ORMAuthenticatorChallengeRepository),
          container.get(TYPES.AuthenticatorChallengePersistenceMapper),
        ),
      )
    container
      .bind<CacheEntryRepositoryInterface>(TYPES.CacheEntryRepository)
      .toConstantValue(
        new TypeORMCacheEntryRepository(
          container.get(TYPES.ORMCacheEntryRepository),
          container.get(TYPES.CacheEntryPersistenceMapper),
        ),
      )

    // Middleware
    container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
    container.bind<SessionMiddleware>(TYPES.SessionMiddleware).to(SessionMiddleware)
    container.bind<LockMiddleware>(TYPES.LockMiddleware).to(LockMiddleware)
    container.bind<AuthMiddlewareWithoutResponse>(TYPES.AuthMiddlewareWithoutResponse).to(AuthMiddlewareWithoutResponse)
    container.bind<ApiGatewayAuthMiddleware>(TYPES.ApiGatewayAuthMiddleware).to(ApiGatewayAuthMiddleware)
    container
      .bind<ApiGatewayOfflineAuthMiddleware>(TYPES.ApiGatewayOfflineAuthMiddleware)
      .to(ApiGatewayOfflineAuthMiddleware)
    container.bind<OfflineUserAuthMiddleware>(TYPES.OfflineUserAuthMiddleware).to(OfflineUserAuthMiddleware)

    // Projectors
    container.bind<SessionProjector>(TYPES.SessionProjector).to(SessionProjector)
    container.bind<UserProjector>(TYPES.UserProjector).to(UserProjector)
    container.bind<RoleProjector>(TYPES.RoleProjector).to(RoleProjector)
    container.bind<PermissionProjector>(TYPES.PermissionProjector).to(PermissionProjector)
    container.bind<SettingProjector>(TYPES.SettingProjector).to(SettingProjector)
    container.bind<SubscriptionSettingProjector>(TYPES.SubscriptionSettingProjector).to(SubscriptionSettingProjector)

    // Factories
    container.bind<SettingFactoryInterface>(TYPES.SettingFactory).to(SettingFactory)

    // env vars
    container.bind(TYPES.JWT_SECRET).toConstantValue(env.get('JWT_SECRET'))
    container.bind(TYPES.LEGACY_JWT_SECRET).toConstantValue(env.get('LEGACY_JWT_SECRET'))
    container.bind(TYPES.AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container.bind(TYPES.AUTH_JWT_TTL).toConstantValue(+env.get('AUTH_JWT_TTL'))
    container.bind(TYPES.VALET_TOKEN_SECRET).toConstantValue(env.get('VALET_TOKEN_SECRET', true))
    container.bind(TYPES.VALET_TOKEN_TTL).toConstantValue(+env.get('VALET_TOKEN_TTL', true))
    container
      .bind(TYPES.WEB_SOCKET_CONNECTION_TOKEN_SECRET)
      .toConstantValue(env.get('WEB_SOCKET_CONNECTION_TOKEN_SECRET', true))
    container.bind(TYPES.ENCRYPTION_SERVER_KEY).toConstantValue(env.get('ENCRYPTION_SERVER_KEY'))
    container.bind(TYPES.ACCESS_TOKEN_AGE).toConstantValue(env.get('ACCESS_TOKEN_AGE'))
    container.bind(TYPES.REFRESH_TOKEN_AGE).toConstantValue(env.get('REFRESH_TOKEN_AGE'))
    container.bind(TYPES.MAX_LOGIN_ATTEMPTS).toConstantValue(env.get('MAX_LOGIN_ATTEMPTS'))
    container.bind(TYPES.FAILED_LOGIN_LOCKOUT).toConstantValue(env.get('FAILED_LOGIN_LOCKOUT'))
    container.bind(TYPES.PSEUDO_KEY_PARAMS_KEY).toConstantValue(env.get('PSEUDO_KEY_PARAMS_KEY'))
    container.bind(TYPES.EPHEMERAL_SESSION_AGE).toConstantValue(env.get('EPHEMERAL_SESSION_AGE'))
    container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
    container
      .bind(TYPES.DISABLE_USER_REGISTRATION)
      .toConstantValue(env.get('DISABLE_USER_REGISTRATION', true) === 'true')
    container.bind(TYPES.SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN'))
    container.bind(TYPES.SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))
    container.bind(TYPES.USER_SERVER_REGISTRATION_URL).toConstantValue(env.get('USER_SERVER_REGISTRATION_URL', true))
    container.bind(TYPES.USER_SERVER_AUTH_KEY).toConstantValue(env.get('USER_SERVER_AUTH_KEY', true))
    container.bind(TYPES.USER_SERVER_CHANGE_EMAIL_URL).toConstantValue(env.get('USER_SERVER_CHANGE_EMAIL_URL', true))
    container.bind(TYPES.NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.SYNCING_SERVER_URL).toConstantValue(env.get('SYNCING_SERVER_URL'))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))
    container.bind(TYPES.PAYMENTS_SERVER_URL).toConstantValue(env.get('PAYMENTS_SERVER_URL', true))
    container
      .bind(TYPES.SESSION_TRACE_DAYS_TTL)
      .toConstantValue(env.get('SESSION_TRACE_DAYS_TTL', true) ? +env.get('SESSION_TRACE_DAYS_TTL', true) : 90)
    container
      .bind(TYPES.U2F_RELYING_PARTY_NAME)
      .toConstantValue(env.get('U2F_RELYING_PARTY_NAME', true) ?? 'Standard Notes')
    container
      .bind(TYPES.U2F_RELYING_PARTY_ID)
      .toConstantValue(env.get('U2F_RELYING_PARTY_ID', true) ?? 'app.standardnotes.com')
    container
      .bind(TYPES.U2F_EXPECTED_ORIGIN)
      .toConstantValue(
        env.get('U2F_EXPECTED_ORIGIN', true)
          ? env.get('U2F_EXPECTED_ORIGIN', true).split(',')
          : ['https://app.standardnotes.com'],
      )
    container
      .bind(TYPES.U2F_REQUIRE_USER_VERIFICATION)
      .toConstantValue(env.get('U2F_REQUIRE_USER_VERIFICATION', true) === 'true')
    container
      .bind(TYPES.READONLY_USERS)
      .toConstantValue(env.get('READONLY_USERS', true) ? env.get('READONLY_USERS', true).split(',') : [])

    if (isConfiguredForHomeServer) {
      container
        .bind<LockRepositoryInterface>(TYPES.LockRepository)
        .toConstantValue(
          new TypeORMLockRepository(
            container.get(TYPES.CacheEntryRepository),
            container.get(TYPES.Timer),
            container.get(TYPES.MAX_LOGIN_ATTEMPTS),
            container.get(TYPES.FAILED_LOGIN_LOCKOUT),
          ),
        )
      container
        .bind<EphemeralSessionRepositoryInterface>(TYPES.EphemeralSessionRepository)
        .toConstantValue(
          new TypeORMEphemeralSessionRepository(
            container.get(TYPES.CacheEntryRepository),
            container.get(TYPES.EPHEMERAL_SESSION_AGE),
            container.get(TYPES.Timer),
          ),
        )
      container
        .bind<OfflineSubscriptionTokenRepositoryInterface>(TYPES.OfflineSubscriptionTokenRepository)
        .toConstantValue(
          new TypeORMOfflineSubscriptionTokenRepository(
            container.get(TYPES.CacheEntryRepository),
            container.get(TYPES.Timer),
          ),
        )
      container
        .bind<PKCERepositoryInterface>(TYPES.PKCERepository)
        .toConstantValue(
          new TypeORMPKCERepository(
            container.get(TYPES.CacheEntryRepository),
            container.get(TYPES.Logger),
            container.get(TYPES.Timer),
          ),
        )
    } else {
      container.bind<PKCERepositoryInterface>(TYPES.PKCERepository).to(RedisPKCERepository)
      container.bind<LockRepositoryInterface>(TYPES.LockRepository).to(LockRepository)
      container
        .bind<EphemeralSessionRepositoryInterface>(TYPES.EphemeralSessionRepository)
        .to(RedisEphemeralSessionRepository)
      container
        .bind<OfflineSubscriptionTokenRepositoryInterface>(TYPES.OfflineSubscriptionTokenRepository)
        .to(RedisOfflineSubscriptionTokenRepository)
    }

    // Services
    container.bind<UAParser>(TYPES.DeviceDetector).toConstantValue(new UAParser())
    container.bind<SessionService>(TYPES.SessionService).to(SessionService)
    container.bind<AuthResponseFactory20161215>(TYPES.AuthResponseFactory20161215).to(AuthResponseFactory20161215)
    container.bind<AuthResponseFactory20190520>(TYPES.AuthResponseFactory20190520).to(AuthResponseFactory20190520)
    container.bind<AuthResponseFactory20200115>(TYPES.AuthResponseFactory20200115).to(AuthResponseFactory20200115)
    container.bind<AuthResponseFactoryResolver>(TYPES.AuthResponseFactoryResolver).to(AuthResponseFactoryResolver)
    container.bind<KeyParamsFactory>(TYPES.KeyParamsFactory).to(KeyParamsFactory)
    container
      .bind<TokenDecoderInterface<SessionTokenData>>(TYPES.SessionTokenDecoder)
      .toConstantValue(new TokenDecoder<SessionTokenData>(container.get(TYPES.JWT_SECRET)))
    container
      .bind<TokenDecoderInterface<SessionTokenData>>(TYPES.FallbackSessionTokenDecoder)
      .toConstantValue(new TokenDecoder<SessionTokenData>(container.get(TYPES.LEGACY_JWT_SECRET)))
    container
      .bind<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.CrossServiceTokenDecoder)
      .toConstantValue(new TokenDecoder<CrossServiceTokenData>(container.get(TYPES.AUTH_JWT_SECRET)))
    container
      .bind<TokenDecoderInterface<OfflineUserTokenData>>(TYPES.OfflineUserTokenDecoder)
      .toConstantValue(new TokenDecoder<OfflineUserTokenData>(container.get(TYPES.AUTH_JWT_SECRET)))
    container
      .bind<TokenDecoderInterface<WebSocketConnectionTokenData>>(TYPES.WebSocketConnectionTokenDecoder)
      .toConstantValue(
        new TokenDecoder<WebSocketConnectionTokenData>(container.get(TYPES.WEB_SOCKET_CONNECTION_TOKEN_SECRET)),
      )
    container
      .bind<TokenEncoderInterface<OfflineUserTokenData>>(TYPES.OfflineUserTokenEncoder)
      .toConstantValue(new TokenEncoder<OfflineUserTokenData>(container.get(TYPES.AUTH_JWT_SECRET)))
    container
      .bind<TokenEncoderInterface<SessionTokenData>>(TYPES.SessionTokenEncoder)
      .toConstantValue(new TokenEncoder<SessionTokenData>(container.get(TYPES.JWT_SECRET)))
    container
      .bind<TokenEncoderInterface<CrossServiceTokenData>>(TYPES.CrossServiceTokenEncoder)
      .toConstantValue(new TokenEncoder<CrossServiceTokenData>(container.get(TYPES.AUTH_JWT_SECRET)))
    container
      .bind<TokenEncoderInterface<ValetTokenData>>(TYPES.ValetTokenEncoder)
      .toConstantValue(new TokenEncoder<ValetTokenData>(container.get(TYPES.VALET_TOKEN_SECRET)))
    container.bind<AuthenticationMethodResolver>(TYPES.AuthenticationMethodResolver).to(AuthenticationMethodResolver)
    container.bind<DomainEventFactory>(TYPES.DomainEventFactory).to(DomainEventFactory)
    container.bind<AxiosInstance>(TYPES.HTTPClient).toConstantValue(axios.create())
    container.bind<CrypterInterface>(TYPES.Crypter).to(CrypterNode)
    container.bind<SettingServiceInterface>(TYPES.SettingService).to(SettingService)
    container.bind<SubscriptionSettingServiceInterface>(TYPES.SubscriptionSettingService).to(SubscriptionSettingService)
    container.bind<OfflineSettingServiceInterface>(TYPES.OfflineSettingService).to(OfflineSettingService)
    container.bind<CryptoNode>(TYPES.CryptoNode).toConstantValue(new CryptoNode())
    container.bind<ContentDecoderInterface>(TYPES.ContenDecoder).toConstantValue(new ContentDecoder())
    container.bind<ClientServiceInterface>(TYPES.WebSocketsClientService).to(WebSocketsClientService)
    container.bind<RoleServiceInterface>(TYPES.RoleService).to(RoleService)
    container.bind<RoleToSubscriptionMapInterface>(TYPES.RoleToSubscriptionMap).to(RoleToSubscriptionMap)
    container.bind<SettingsAssociationServiceInterface>(TYPES.SettingsAssociationService).to(SettingsAssociationService)
    container
      .bind<SubscriptionSettingsAssociationServiceInterface>(TYPES.SubscriptionSettingsAssociationService)
      .to(SubscriptionSettingsAssociationService)
    container.bind<FeatureServiceInterface>(TYPES.FeatureService).to(FeatureService)
    container.bind<SettingInterpreterInterface>(TYPES.SettingInterpreter).to(SettingInterpreter)
    container.bind<SettingDecrypterInterface>(TYPES.SettingDecrypter).to(SettingDecrypter)
    container
      .bind<SelectorInterface<ProtocolVersion>>(TYPES.ProtocolVersionSelector)
      .toConstantValue(new DeterministicSelector<ProtocolVersion>())
    container
      .bind<SelectorInterface<boolean>>(TYPES.BooleanSelector)
      .toConstantValue(new DeterministicSelector<boolean>())
    container.bind<UserSubscriptionServiceInterface>(TYPES.UserSubscriptionService).to(UserSubscriptionService)

    container
      .bind<SNSDomainEventPublisher>(TYPES.DomainEventPublisher)
      .toConstantValue(new SNSDomainEventPublisher(container.get(TYPES.SNS), container.get(TYPES.SNS_TOPIC_ARN)))

    // use cases
    container
      .bind<TraceSession>(TYPES.TraceSession)
      .toConstantValue(
        new TraceSession(
          container.get(TYPES.SessionTraceRepository),
          container.get(TYPES.Timer),
          container.get(TYPES.SESSION_TRACE_DAYS_TTL),
        ),
      )
    container
      .bind<PersistStatistics>(TYPES.PersistStatistics)
      .toConstantValue(
        new PersistStatistics(
          container.get(TYPES.SessionTraceRepository),
          container.get(TYPES.DomainEventPublisher),
          container.get(TYPES.DomainEventFactory),
          container.get(TYPES.Timer),
        ),
      )
    container
      .bind<GenerateAuthenticatorRegistrationOptions>(TYPES.GenerateAuthenticatorRegistrationOptions)
      .toConstantValue(
        new GenerateAuthenticatorRegistrationOptions(
          container.get(TYPES.AuthenticatorRepository),
          container.get(TYPES.AuthenticatorChallengeRepository),
          container.get(TYPES.U2F_RELYING_PARTY_NAME),
          container.get(TYPES.U2F_RELYING_PARTY_ID),
          container.get(TYPES.UserRepository),
          container.get(TYPES.FeatureService),
        ),
      )
    container
      .bind<VerifyAuthenticatorRegistrationResponse>(TYPES.VerifyAuthenticatorRegistrationResponse)
      .toConstantValue(
        new VerifyAuthenticatorRegistrationResponse(
          container.get(TYPES.AuthenticatorRepository),
          container.get(TYPES.AuthenticatorChallengeRepository),
          container.get(TYPES.U2F_RELYING_PARTY_ID),
          container.get(TYPES.U2F_EXPECTED_ORIGIN),
          container.get(TYPES.U2F_REQUIRE_USER_VERIFICATION),
          container.get(TYPES.UserRepository),
          container.get(TYPES.FeatureService),
        ),
      )
    container
      .bind<GenerateAuthenticatorAuthenticationOptions>(TYPES.GenerateAuthenticatorAuthenticationOptions)
      .toConstantValue(
        new GenerateAuthenticatorAuthenticationOptions(
          container.get(TYPES.UserRepository),
          container.get(TYPES.AuthenticatorRepository),
          container.get(TYPES.AuthenticatorChallengeRepository),
          container.get(TYPES.PSEUDO_KEY_PARAMS_KEY),
        ),
      )
    container
      .bind<VerifyAuthenticatorAuthenticationResponse>(TYPES.VerifyAuthenticatorAuthenticationResponse)
      .toConstantValue(
        new VerifyAuthenticatorAuthenticationResponse(
          container.get(TYPES.AuthenticatorRepository),
          container.get(TYPES.AuthenticatorChallengeRepository),
          container.get(TYPES.U2F_RELYING_PARTY_ID),
          container.get(TYPES.U2F_EXPECTED_ORIGIN),
          container.get(TYPES.U2F_REQUIRE_USER_VERIFICATION),
        ),
      )
    container
      .bind<ListAuthenticators>(TYPES.ListAuthenticators)
      .toConstantValue(
        new ListAuthenticators(
          container.get(TYPES.AuthenticatorRepository),
          container.get(TYPES.UserRepository),
          container.get(TYPES.FeatureService),
        ),
      )
    container
      .bind<DeleteAuthenticator>(TYPES.DeleteAuthenticator)
      .toConstantValue(
        new DeleteAuthenticator(
          container.get(TYPES.AuthenticatorRepository),
          container.get(TYPES.UserRepository),
          container.get(TYPES.FeatureService),
        ),
      )
    container
      .bind<GenerateRecoveryCodes>(TYPES.GenerateRecoveryCodes)
      .toConstantValue(
        new GenerateRecoveryCodes(
          container.get(TYPES.UserRepository),
          container.get(TYPES.SettingService),
          container.get(TYPES.CryptoNode),
        ),
      )

    container
      .bind<CleanupSessionTraces>(TYPES.CleanupSessionTraces)
      .toConstantValue(new CleanupSessionTraces(container.get(TYPES.SessionTraceRepository)))
    container
      .bind<CleanupExpiredSessions>(TYPES.CleanupExpiredSessions)
      .toConstantValue(new CleanupExpiredSessions(container.get(TYPES.SessionRepository)))
    container.bind<AuthenticateUser>(TYPES.AuthenticateUser).to(AuthenticateUser)
    container.bind<AuthenticateRequest>(TYPES.AuthenticateRequest).to(AuthenticateRequest)
    container.bind<RefreshSessionToken>(TYPES.RefreshSessionToken).to(RefreshSessionToken)
    container.bind<SignIn>(TYPES.SignIn).to(SignIn)
    container.bind<VerifyMFA>(TYPES.VerifyMFA).to(VerifyMFA)
    container.bind<ClearLoginAttempts>(TYPES.ClearLoginAttempts).to(ClearLoginAttempts)
    container.bind<IncreaseLoginAttempts>(TYPES.IncreaseLoginAttempts).to(IncreaseLoginAttempts)
    container
      .bind<GetUserKeyParamsRecovery>(TYPES.GetUserKeyParamsRecovery)
      .toConstantValue(
        new GetUserKeyParamsRecovery(
          container.get(TYPES.KeyParamsFactory),
          container.get(TYPES.UserRepository),
          container.get(TYPES.PKCERepository),
          container.get(TYPES.SettingService),
        ),
      )
    container.bind<GetUserKeyParams>(TYPES.GetUserKeyParams).to(GetUserKeyParams)
    container.bind<UpdateUser>(TYPES.UpdateUser).to(UpdateUser)
    container.bind<Register>(TYPES.Register).to(Register)
    container.bind<GetActiveSessionsForUser>(TYPES.GetActiveSessionsForUser).to(GetActiveSessionsForUser)
    container.bind<DeletePreviousSessionsForUser>(TYPES.DeletePreviousSessionsForUser).to(DeletePreviousSessionsForUser)
    container.bind<DeleteSessionForUser>(TYPES.DeleteSessionForUser).to(DeleteSessionForUser)
    container.bind<ChangeCredentials>(TYPES.ChangeCredentials).to(ChangeCredentials)
    container.bind<GetSettings>(TYPES.GetSettings).to(GetSettings)
    container.bind<GetSetting>(TYPES.GetSetting).to(GetSetting)
    container.bind<GetUserFeatures>(TYPES.GetUserFeatures).to(GetUserFeatures)
    container.bind<UpdateSetting>(TYPES.UpdateSetting).to(UpdateSetting)
    container.bind<DeleteSetting>(TYPES.DeleteSetting).to(DeleteSetting)
    container
      .bind<SignInWithRecoveryCodes>(TYPES.SignInWithRecoveryCodes)
      .toConstantValue(
        new SignInWithRecoveryCodes(
          container.get(TYPES.UserRepository),
          container.get(TYPES.AuthResponseFactory20200115),
          container.get(TYPES.PKCERepository),
          container.get(TYPES.Crypter),
          container.get(TYPES.SettingService),
          container.get(TYPES.GenerateRecoveryCodes),
          container.get(TYPES.IncreaseLoginAttempts),
          container.get(TYPES.ClearLoginAttempts),
          container.get(TYPES.DeleteSetting),
          container.get(TYPES.AuthenticatorRepository),
        ),
      )
    container.bind<DeleteAccount>(TYPES.DeleteAccount).to(DeleteAccount)
    container.bind<GetUserSubscription>(TYPES.GetUserSubscription).to(GetUserSubscription)
    container.bind<GetUserOfflineSubscription>(TYPES.GetUserOfflineSubscription).to(GetUserOfflineSubscription)
    container.bind<CreateSubscriptionToken>(TYPES.CreateSubscriptionToken).to(CreateSubscriptionToken)
    container.bind<AuthenticateSubscriptionToken>(TYPES.AuthenticateSubscriptionToken).to(AuthenticateSubscriptionToken)
    container
      .bind<AuthenticateOfflineSubscriptionToken>(TYPES.AuthenticateOfflineSubscriptionToken)
      .to(AuthenticateOfflineSubscriptionToken)
    container
      .bind<CreateOfflineSubscriptionToken>(TYPES.CreateOfflineSubscriptionToken)
      .to(CreateOfflineSubscriptionToken)
    container.bind<CreateValetToken>(TYPES.CreateValetToken).to(CreateValetToken)
    container.bind<CreateListedAccount>(TYPES.CreateListedAccount).to(CreateListedAccount)
    container.bind<InviteToSharedSubscription>(TYPES.InviteToSharedSubscription).to(InviteToSharedSubscription)
    container
      .bind<AcceptSharedSubscriptionInvitation>(TYPES.AcceptSharedSubscriptionInvitation)
      .to(AcceptSharedSubscriptionInvitation)
    container
      .bind<DeclineSharedSubscriptionInvitation>(TYPES.DeclineSharedSubscriptionInvitation)
      .to(DeclineSharedSubscriptionInvitation)
    container
      .bind<CancelSharedSubscriptionInvitation>(TYPES.CancelSharedSubscriptionInvitation)
      .to(CancelSharedSubscriptionInvitation)
    container
      .bind<ListSharedSubscriptionInvitations>(TYPES.ListSharedSubscriptionInvitations)
      .to(ListSharedSubscriptionInvitations)
    container.bind<VerifyPredicate>(TYPES.VerifyPredicate).to(VerifyPredicate)
    container.bind<CreateCrossServiceToken>(TYPES.CreateCrossServiceToken).to(CreateCrossServiceToken)
    container.bind<ProcessUserRequest>(TYPES.ProcessUserRequest).to(ProcessUserRequest)

    // Controller
    container.bind<AuthController>(TYPES.AuthController).to(AuthController)
    container
      .bind<AuthenticatorsController>(TYPES.AuthenticatorsController)
      .toConstantValue(
        new AuthenticatorsController(
          container.get(TYPES.GenerateAuthenticatorRegistrationOptions),
          container.get(TYPES.VerifyAuthenticatorRegistrationResponse),
          container.get(TYPES.GenerateAuthenticatorAuthenticationOptions),
          container.get(TYPES.ListAuthenticators),
          container.get(TYPES.DeleteAuthenticator),
          container.get(TYPES.AuthenticatorHttpMapper),
        ),
      )
    container.bind<SubscriptionInvitesController>(TYPES.SubscriptionInvitesController).to(SubscriptionInvitesController)
    container.bind<UserRequestsController>(TYPES.UserRequestsController).to(UserRequestsController)

    // Handlers
    container.bind<UserRegisteredEventHandler>(TYPES.UserRegisteredEventHandler).to(UserRegisteredEventHandler)
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.AccountDeletionRequestedEventHandler)
      .to(AccountDeletionRequestedEventHandler)
    container
      .bind<SubscriptionPurchasedEventHandler>(TYPES.SubscriptionPurchasedEventHandler)
      .to(SubscriptionPurchasedEventHandler)
    container
      .bind<SubscriptionCancelledEventHandler>(TYPES.SubscriptionCancelledEventHandler)
      .to(SubscriptionCancelledEventHandler)
    container
      .bind<SubscriptionRenewedEventHandler>(TYPES.SubscriptionRenewedEventHandler)
      .to(SubscriptionRenewedEventHandler)
    container
      .bind<SubscriptionRefundedEventHandler>(TYPES.SubscriptionRefundedEventHandler)
      .to(SubscriptionRefundedEventHandler)
    container
      .bind<SubscriptionExpiredEventHandler>(TYPES.SubscriptionExpiredEventHandler)
      .to(SubscriptionExpiredEventHandler)
    container
      .bind<SubscriptionSyncRequestedEventHandler>(TYPES.SubscriptionSyncRequestedEventHandler)
      .to(SubscriptionSyncRequestedEventHandler)
    container
      .bind<ExtensionKeyGrantedEventHandler>(TYPES.ExtensionKeyGrantedEventHandler)
      .to(ExtensionKeyGrantedEventHandler)
    container
      .bind<SubscriptionReassignedEventHandler>(TYPES.SubscriptionReassignedEventHandler)
      .to(SubscriptionReassignedEventHandler)
    container.bind<UserEmailChangedEventHandler>(TYPES.UserEmailChangedEventHandler).to(UserEmailChangedEventHandler)
    container.bind<FileUploadedEventHandler>(TYPES.FileUploadedEventHandler).to(FileUploadedEventHandler)
    container.bind<FileRemovedEventHandler>(TYPES.FileRemovedEventHandler).to(FileRemovedEventHandler)
    container
      .bind<ListedAccountCreatedEventHandler>(TYPES.ListedAccountCreatedEventHandler)
      .to(ListedAccountCreatedEventHandler)
    container
      .bind<ListedAccountDeletedEventHandler>(TYPES.ListedAccountDeletedEventHandler)
      .to(ListedAccountDeletedEventHandler)
    container
      .bind<UserDisabledSessionUserAgentLoggingEventHandler>(TYPES.UserDisabledSessionUserAgentLoggingEventHandler)
      .to(UserDisabledSessionUserAgentLoggingEventHandler)
    container
      .bind<SharedSubscriptionInvitationCreatedEventHandler>(TYPES.SharedSubscriptionInvitationCreatedEventHandler)
      .to(SharedSubscriptionInvitationCreatedEventHandler)
    container
      .bind<PredicateVerificationRequestedEventHandler>(TYPES.PredicateVerificationRequestedEventHandler)
      .to(PredicateVerificationRequestedEventHandler)

    container
      .bind<EmailSubscriptionUnsubscribedEventHandler>(TYPES.EmailSubscriptionUnsubscribedEventHandler)
      .toConstantValue(
        new EmailSubscriptionUnsubscribedEventHandler(
          container.get(TYPES.UserRepository),
          container.get(TYPES.SettingService),
        ),
      )

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['USER_REGISTERED', container.get(TYPES.UserRegisteredEventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.AccountDeletionRequestedEventHandler)],
      ['SUBSCRIPTION_PURCHASED', container.get(TYPES.SubscriptionPurchasedEventHandler)],
      ['SUBSCRIPTION_CANCELLED', container.get(TYPES.SubscriptionCancelledEventHandler)],
      ['SUBSCRIPTION_RENEWED', container.get(TYPES.SubscriptionRenewedEventHandler)],
      ['SUBSCRIPTION_REFUNDED', container.get(TYPES.SubscriptionRefundedEventHandler)],
      ['SUBSCRIPTION_EXPIRED', container.get(TYPES.SubscriptionExpiredEventHandler)],
      ['SUBSCRIPTION_SYNC_REQUESTED', container.get(TYPES.SubscriptionSyncRequestedEventHandler)],
      ['EXTENSION_KEY_GRANTED', container.get(TYPES.ExtensionKeyGrantedEventHandler)],
      ['SUBSCRIPTION_REASSIGNED', container.get(TYPES.SubscriptionReassignedEventHandler)],
      ['USER_EMAIL_CHANGED', container.get(TYPES.UserEmailChangedEventHandler)],
      ['FILE_UPLOADED', container.get(TYPES.FileUploadedEventHandler)],
      ['FILE_REMOVED', container.get(TYPES.FileRemovedEventHandler)],
      ['LISTED_ACCOUNT_CREATED', container.get(TYPES.ListedAccountCreatedEventHandler)],
      ['LISTED_ACCOUNT_DELETED', container.get(TYPES.ListedAccountDeletedEventHandler)],
      [
        'USER_DISABLED_SESSION_USER_AGENT_LOGGING',
        container.get(TYPES.UserDisabledSessionUserAgentLoggingEventHandler),
      ],
      ['SHARED_SUBSCRIPTION_INVITATION_CREATED', container.get(TYPES.SharedSubscriptionInvitationCreatedEventHandler)],
      ['PREDICATE_VERIFICATION_REQUESTED', container.get(TYPES.PredicateVerificationRequestedEventHandler)],
      ['EMAIL_SUBSCRIPTION_UNSUBSCRIBED', container.get(TYPES.EmailSubscriptionUnsubscribedEventHandler)],
    ])

    container
      .bind<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler)
      .toConstantValue(
        env.get('NEW_RELIC_ENABLED', true) === 'true'
          ? new SQSNewRelicEventMessageHandler(eventHandlers, container.get(TYPES.Logger))
          : new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Logger)),
      )
    container
      .bind<DomainEventSubscriberFactoryInterface>(TYPES.DomainEventSubscriberFactory)
      .toConstantValue(
        new SQSDomainEventSubscriberFactory(
          container.get(TYPES.SQS),
          container.get(TYPES.SQS_QUEUE_URL),
          container.get(TYPES.DomainEventMessageHandler),
        ),
      )

    return container
  }
}
