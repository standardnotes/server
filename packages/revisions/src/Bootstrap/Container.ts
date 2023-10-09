import {
  ControllerContainer,
  ControllerContainerInterface,
  MapperInterface,
  ServiceIdentifier,
} from '@standardnotes/domain-core'
import Redis from 'ioredis'
import { Container, interfaces } from 'inversify'
import { MongoRepository, Repository } from 'typeorm'
import * as winston from 'winston'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'

import { Revision } from '../Domain/Revision/Revision'
import { RevisionMetadata } from '../Domain/Revision/RevisionMetadata'
import { RevisionRepositoryInterface } from '../Domain/Revision/RevisionRepositoryInterface'
import { SQLLegacyRevisionRepository } from '../Infra/TypeORM/SQL/SQLLegacyRevisionRepository'
import { SQLLegacyRevision } from '../Infra/TypeORM/SQL/SQLLegacyRevision'
import { AppDataSource } from './DataSource'
import { Env } from './Env'
import TYPES from './Types'
import { TokenDecoderInterface, CrossServiceTokenData, TokenDecoder } from '@standardnotes/security'
import { TimerInterface, Timer } from '@standardnotes/time'
import { ApiGatewayAuthMiddleware } from '../Infra/InversifyExpress/Middleware/ApiGatewayAuthMiddleware'
import { DeleteRevision } from '../Domain/UseCase/DeleteRevision/DeleteRevision'
import { GetRequiredRoleToViewRevision } from '../Domain/UseCase/GetRequiredRoleToViewRevision/GetRequiredRoleToViewRevision'
import { GetRevision } from '../Domain/UseCase/GetRevision/GetRevision'
import { GetRevisionsMetada } from '../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'
import { RevisionMetadataHttpMapper } from '../Mapping/Http/RevisionMetadataHttpMapper'
import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import {
  DomainEventMessageHandlerInterface,
  DomainEventHandlerInterface,
  DomainEventSubscriberFactoryInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'
import {
  SQSEventMessageHandler,
  SQSDomainEventSubscriberFactory,
  DirectCallEventMessageHandler,
  DirectCallDomainEventPublisher,
  SNSDomainEventPublisher,
  OpenTelemetrySDKInterface,
  OpenTelemetrySDK,
  SQSOpenTelemetryEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { DumpRepositoryInterface } from '../Domain/Dump/DumpRepositoryInterface'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { ItemDumpedEventHandler } from '../Domain/Handler/ItemDumpedEventHandler'
import { RevisionsCopyRequestedEventHandler } from '../Domain/Handler/RevisionsCopyRequestedEventHandler'
import { CopyRevisions } from '../Domain/UseCase/CopyRevisions/CopyRevisions'
import { FSDumpRepository } from '../Infra/FS/FSDumpRepository'
import { S3DumpRepository } from '../Infra/S3/S3ItemDumpRepository'
import { RevisionItemStringMapper } from '../Mapping/Backup/RevisionItemStringMapper'
import { BaseRevisionsController } from '../Infra/InversifyExpress/Base/BaseRevisionsController'
import { Transform } from 'stream'
import { MongoDBRevision } from '../Infra/TypeORM/MongoDB/MongoDBRevision'
import { MongoDBRevisionRepository } from '../Infra/TypeORM/MongoDB/MongoDBRevisionRepository'
import { SQLLegacyRevisionMetadataPersistenceMapper } from '../Mapping/Persistence/SQL/SQLLegacyRevisionMetadataPersistenceMapper'
import { SQLLegacyRevisionPersistenceMapper } from '../Mapping/Persistence/SQL/SQLLegacyRevisionPersistenceMapper'
import { MongoDBRevisionMetadataPersistenceMapper } from '../Mapping/Persistence/MongoDB/MongoDBRevisionMetadataPersistenceMapper'
import { MongoDBRevisionPersistenceMapper } from '../Mapping/Persistence/MongoDB/MongoDBRevisionPersistenceMapper'
import { RevisionHttpMapper } from '../Mapping/Http/RevisionHttpMapper'
import { RevisionRepositoryResolverInterface } from '../Domain/Revision/RevisionRepositoryResolverInterface'
import { TypeORMRevisionRepositoryResolver } from '../Infra/TypeORM/TypeORMRevisionRepositoryResolver'
import { RevisionMetadataHttpRepresentation } from '../Mapping/Http/RevisionMetadataHttpRepresentation'
import { RevisionHttpRepresentation } from '../Mapping/Http/RevisionHttpRepresentation'
import { TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser } from '../Domain/UseCase/Transition/TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser/TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { DomainEventFactory } from '../Domain/Event/DomainEventFactory'
import { SQLRevision } from '../Infra/TypeORM/SQL/SQLRevision'
import { SQLRevisionRepository } from '../Infra/TypeORM/SQL/SQLRevisionRepository'
import { SQLRevisionMetadataPersistenceMapper } from '../Mapping/Persistence/SQL/SQLRevisionMetadataPersistenceMapper'
import { SQLRevisionPersistenceMapper } from '../Mapping/Persistence/SQL/SQLRevisionPersistenceMapper'
import { RemoveRevisionsFromSharedVault } from '../Domain/UseCase/RemoveRevisionsFromSharedVault/RemoveRevisionsFromSharedVault'
import { ItemRemovedFromSharedVaultEventHandler } from '../Domain/Handler/ItemRemovedFromSharedVaultEventHandler'
import { TransitionRequestedEventHandler } from '../Domain/Handler/TransitionRequestedEventHandler'
import { SharedVaultRemovedEventHandler } from '../Domain/Handler/SharedVaultRemovedEventHandler'
import { TransitionRepositoryInterface } from '../Domain/Transition/TransitionRepositoryInterface'
import { RedisTransitionRepository } from '../Infra/Redis/RedisTransitionRepository'
import { CreateRevisionFromDump } from '../Domain/UseCase/CreateRevisionFromDump/CreateRevisionFromDump'

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

    const isConfiguredForHomeServer = env.get('MODE', true) === 'home-server'
    const isConfiguredForSelfHosting = env.get('MODE', true) === 'self-hosted'
    const isConfiguredForHomeServerOrSelfHosting = isConfiguredForHomeServer || isConfiguredForSelfHosting
    const isSecondaryDatabaseEnabled = env.get('SECONDARY_DB_ENABLED', true) === 'true'
    const isConfiguredForInMemoryCache = env.get('CACHE_TYPE', true) === 'memory'

    const container = new Container({
      defaultScope: 'Singleton',
    })

    container
      .bind<boolean>(TYPES.Revisions_IS_CONFIGURED_FOR_HOME_SERVER_OR_SELF_HOSTING)
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

      container.bind(TYPES.Revisions_Redis).toConstantValue(redis)
      container
        .bind<TransitionRepositoryInterface>(TYPES.Revisions_TransitionStatusRepository)
        .toConstantValue(new RedisTransitionRepository(container.get<Redis>(TYPES.Revisions_Redis)))
    }

    let logger: winston.Logger
    if (configuration?.logger) {
      logger = configuration.logger as winston.Logger
    } else {
      const winstonFormatters = [winston.format.splat(), winston.format.json()]
      if (env.get('NEW_RELIC_ENABLED', true) === 'true') {
        await import('newrelic')
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const newrelicFormatter = require('@newrelic/winston-enricher')
        const newrelicWinstonFormatter = newrelicFormatter(winston)
        winstonFormatters.push(newrelicWinstonFormatter())
      }

      logger = winston.createLogger({
        level: env.get('LOG_LEVEL', true) || 'info',
        format: winston.format.combine(...winstonFormatters),
        transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL', true) || 'info' })],
        defaultMeta: { service: 'revisions' },
      })
    }
    container.bind<winston.Logger>(TYPES.Revisions_Logger).toConstantValue(logger)

    container.bind<TimerInterface>(TYPES.Revisions_Timer).toDynamicValue(() => new Timer())

    const appDataSource = new AppDataSource({ env, runMigrations: this.mode === 'server' })
    await appDataSource.initialize()

    logger.debug('Database initialized')

    container.bind<Env>(TYPES.Revisions_Env).toConstantValue(env)

    container.bind(TYPES.Revisions_NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.Revisions_VERSION).toConstantValue(env.get('VERSION', true) ?? 'development')

    if (!isConfiguredForHomeServerOrSelfHosting) {
      container
        .bind<OpenTelemetrySDKInterface>(TYPES.Revisions_OpenTelemetrySDK)
        .toConstantValue(
          new OpenTelemetrySDK(
            this.mode === 'server' ? ServiceIdentifier.NAMES.Revisions : ServiceIdentifier.NAMES.RevisionsWorker,
          ),
        )
    }

    if (!isConfiguredForHomeServer) {
      // env vars
      container.bind(TYPES.Revisions_SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN'))
      container.bind(TYPES.Revisions_SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
      container.bind(TYPES.Revisions_SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))
      container.bind(TYPES.Revisions_S3_AWS_REGION).toConstantValue(env.get('S3_AWS_REGION', true))
      container.bind(TYPES.Revisions_S3_BACKUP_BUCKET_NAME).toConstantValue(env.get('S3_BACKUP_BUCKET_NAME', true))

      container.bind<SNSClient>(TYPES.Revisions_SNS).toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Revisions_Env)

        const snsConfig: SNSClientConfig = {
          apiVersion: 'latest',
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

        return new SNSClient(snsConfig)
      })

      container
        .bind<DomainEventPublisherInterface>(TYPES.Revisions_DomainEventPublisher)
        .toDynamicValue((context: interfaces.Context) => {
          return new SNSDomainEventPublisher(
            context.container.get(TYPES.Revisions_SNS),
            context.container.get(TYPES.Revisions_SNS_TOPIC_ARN),
          )
        })

      container.bind<SQSClient>(TYPES.Revisions_SQS).toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Revisions_Env)

        const sqsConfig: SQSClientConfig = {
          region: env.get('SQS_AWS_REGION'),
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

        return new SQSClient(sqsConfig)
      })

      container.bind<S3Client | undefined>(TYPES.Revisions_S3).toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Revisions_Env)

        let s3Client = undefined
        if (env.get('S3_AWS_REGION', true)) {
          s3Client = new S3Client({
            apiVersion: 'latest',
            region: env.get('S3_AWS_REGION', true),
          })
        }

        return s3Client
      })
    } else {
      container
        .bind<DomainEventPublisherInterface>(TYPES.Revisions_DomainEventPublisher)
        .toConstantValue(directCallDomainEventPublisher)
    }

    container
      .bind<DomainEventFactoryInterface>(TYPES.Revisions_DomainEventFactory)
      .toConstantValue(new DomainEventFactory(container.get(TYPES.Revisions_Timer)))

    // Map
    container
      .bind<MapperInterface<RevisionMetadata, SQLLegacyRevision>>(
        TYPES.Revisions_SQLLegacyRevisionMetadataPersistenceMapper,
      )
      .toConstantValue(new SQLLegacyRevisionMetadataPersistenceMapper())
    container
      .bind<MapperInterface<RevisionMetadata, SQLRevision>>(TYPES.Revisions_SQLRevisionMetadataPersistenceMapper)
      .toConstantValue(new SQLRevisionMetadataPersistenceMapper())
    container
      .bind<MapperInterface<Revision, SQLLegacyRevision>>(TYPES.Revisions_SQLLegacyRevisionPersistenceMapper)
      .toConstantValue(new SQLLegacyRevisionPersistenceMapper(container.get<TimerInterface>(TYPES.Revisions_Timer)))
    container
      .bind<MapperInterface<Revision, SQLRevision>>(TYPES.Revisions_SQLRevisionPersistenceMapper)
      .toConstantValue(new SQLRevisionPersistenceMapper(container.get<TimerInterface>(TYPES.Revisions_Timer)))
    container
      .bind<MapperInterface<RevisionMetadata, MongoDBRevision>>(
        TYPES.Revisions_MongoDBRevisionMetadataPersistenceMapper,
      )
      .toConstantValue(new MongoDBRevisionMetadataPersistenceMapper())
    container
      .bind<MapperInterface<Revision, MongoDBRevision>>(TYPES.Revisions_MongoDBRevisionPersistenceMapper)
      .toConstantValue(new MongoDBRevisionPersistenceMapper(container.get<TimerInterface>(TYPES.Revisions_Timer)))

    // ORM
    container
      .bind<Repository<SQLLegacyRevision>>(TYPES.Revisions_ORMLegacyRevisionRepository)
      .toDynamicValue(() => appDataSource.getRepository(SQLLegacyRevision))
    container
      .bind<Repository<SQLRevision>>(TYPES.Revisions_ORMRevisionRepository)
      .toConstantValue(appDataSource.getRepository(SQLRevision))

    // Repositories
    container
      .bind<RevisionRepositoryInterface>(TYPES.Revisions_SQLRevisionRepository)
      .toConstantValue(
        isConfiguredForHomeServerOrSelfHosting
          ? new SQLRevisionRepository(
              container.get<Repository<SQLRevision>>(TYPES.Revisions_ORMRevisionRepository),
              container.get<MapperInterface<RevisionMetadata, SQLRevision>>(
                TYPES.Revisions_SQLRevisionMetadataPersistenceMapper,
              ),
              container.get<MapperInterface<Revision, SQLRevision>>(TYPES.Revisions_SQLRevisionPersistenceMapper),
              container.get<winston.Logger>(TYPES.Revisions_Logger),
            )
          : new SQLLegacyRevisionRepository(
              container.get<Repository<SQLLegacyRevision>>(TYPES.Revisions_ORMLegacyRevisionRepository),
              container.get<MapperInterface<RevisionMetadata, SQLLegacyRevision>>(
                TYPES.Revisions_SQLLegacyRevisionMetadataPersistenceMapper,
              ),
              container.get<MapperInterface<Revision, SQLLegacyRevision>>(
                TYPES.Revisions_SQLLegacyRevisionPersistenceMapper,
              ),
              container.get<winston.Logger>(TYPES.Revisions_Logger),
            ),
      )

    if (isSecondaryDatabaseEnabled) {
      container
        .bind<MongoRepository<MongoDBRevision>>(TYPES.Revisions_ORMMongoRevisionRepository)
        .toConstantValue(appDataSource.getMongoRepository(MongoDBRevision))

      container
        .bind<RevisionRepositoryInterface>(TYPES.Revisions_MongoDBRevisionRepository)
        .toConstantValue(
          new MongoDBRevisionRepository(
            container.get<MongoRepository<MongoDBRevision>>(TYPES.Revisions_ORMMongoRevisionRepository),
            container.get<MapperInterface<RevisionMetadata, MongoDBRevision>>(
              TYPES.Revisions_MongoDBRevisionMetadataPersistenceMapper,
            ),
            container.get<MapperInterface<Revision, MongoDBRevision>>(TYPES.Revisions_MongoDBRevisionPersistenceMapper),
            container.get<winston.Logger>(TYPES.Revisions_Logger),
          ),
        )
    }

    container
      .bind<RevisionRepositoryResolverInterface>(TYPES.Revisions_RevisionRepositoryResolver)
      .toConstantValue(
        new TypeORMRevisionRepositoryResolver(
          container.get<RevisionRepositoryInterface>(TYPES.Revisions_SQLRevisionRepository),
          isSecondaryDatabaseEnabled
            ? container.get<RevisionRepositoryInterface>(TYPES.Revisions_MongoDBRevisionRepository)
            : null,
        ),
      )

    container
      .bind<GetRequiredRoleToViewRevision>(TYPES.Revisions_GetRequiredRoleToViewRevision)
      .toDynamicValue((context: interfaces.Context) => {
        return new GetRequiredRoleToViewRevision(context.container.get(TYPES.Revisions_Timer))
      })

    // Map
    container
      .bind<MapperInterface<Revision, RevisionHttpRepresentation>>(TYPES.Revisions_RevisionHttpMapper)
      .toDynamicValue(() => new RevisionHttpMapper())
    container
      .bind<MapperInterface<RevisionMetadata, RevisionMetadataHttpRepresentation>>(
        TYPES.Revisions_RevisionMetadataHttpMapper,
      )
      .toDynamicValue((context: interfaces.Context) => {
        return new RevisionMetadataHttpMapper(context.container.get(TYPES.Revisions_GetRequiredRoleToViewRevision))
      })
    container
      .bind<MapperInterface<Revision, string>>(TYPES.Revisions_RevisionItemStringMapper)
      .toDynamicValue(() => new RevisionItemStringMapper())

    container
      .bind<DumpRepositoryInterface>(TYPES.Revisions_DumpRepository)
      .toConstantValue(
        env.get('S3_AWS_REGION', true)
          ? new S3DumpRepository(
              container.get(TYPES.Revisions_S3_BACKUP_BUCKET_NAME),
              container.get(TYPES.Revisions_S3),
              container.get(TYPES.Revisions_RevisionItemStringMapper),
            )
          : new FSDumpRepository(container.get(TYPES.Revisions_RevisionItemStringMapper)),
      )

    // use cases
    container
      .bind<GetRevisionsMetada>(TYPES.Revisions_GetRevisionsMetada)
      .toConstantValue(
        new GetRevisionsMetada(
          container.get<RevisionRepositoryResolverInterface>(TYPES.Revisions_RevisionRepositoryResolver),
        ),
      )
    container
      .bind<GetRevision>(TYPES.Revisions_GetRevision)
      .toConstantValue(
        new GetRevision(container.get<RevisionRepositoryResolverInterface>(TYPES.Revisions_RevisionRepositoryResolver)),
      )
    container
      .bind<DeleteRevision>(TYPES.Revisions_DeleteRevision)
      .toConstantValue(
        new DeleteRevision(
          container.get<RevisionRepositoryResolverInterface>(TYPES.Revisions_RevisionRepositoryResolver),
        ),
      )
    container
      .bind<CopyRevisions>(TYPES.Revisions_CopyRevisions)
      .toConstantValue(
        new CopyRevisions(
          container.get<RevisionRepositoryResolverInterface>(TYPES.Revisions_RevisionRepositoryResolver),
        ),
      )
    container
      .bind<TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser>(
        TYPES.Revisions_TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser,
      )
      .toConstantValue(
        new TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser(
          container.get<RevisionRepositoryInterface>(TYPES.Revisions_SQLRevisionRepository),
          isSecondaryDatabaseEnabled
            ? container.get<RevisionRepositoryInterface>(TYPES.Revisions_MongoDBRevisionRepository)
            : null,
          isConfiguredForInMemoryCache
            ? null
            : container.get<TransitionRepositoryInterface>(TYPES.Revisions_TransitionStatusRepository),
          container.get<TimerInterface>(TYPES.Revisions_Timer),
          container.get<winston.Logger>(TYPES.Revisions_Logger),
          env.get('MIGRATION_BATCH_SIZE', true) ? +env.get('MIGRATION_BATCH_SIZE', true) : 100,
          container.get<DomainEventPublisherInterface>(TYPES.Revisions_DomainEventPublisher),
          container.get<DomainEventFactoryInterface>(TYPES.Revisions_DomainEventFactory),
        ),
      )
    container
      .bind<RemoveRevisionsFromSharedVault>(TYPES.Revisions_RemoveRevisionsFromSharedVault)
      .toConstantValue(
        new RemoveRevisionsFromSharedVault(
          isSecondaryDatabaseEnabled
            ? container.get<RevisionRepositoryInterface>(TYPES.Revisions_MongoDBRevisionRepository)
            : container.get<RevisionRepositoryInterface>(TYPES.Revisions_SQLRevisionRepository),
        ),
      )
    container
      .bind<CreateRevisionFromDump>(TYPES.Revisions_CreateRevisionFromDump)
      .toConstantValue(
        new CreateRevisionFromDump(
          container.get<DumpRepositoryInterface>(TYPES.Revisions_DumpRepository),
          container.get<RevisionRepositoryResolverInterface>(TYPES.Revisions_RevisionRepositoryResolver),
        ),
      )

    // env vars
    container.bind(TYPES.Revisions_AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))

    // Controller
    container
      .bind<ControllerContainerInterface>(TYPES.Revisions_ControllerContainer)
      .toConstantValue(configuration?.controllerConatiner ?? new ControllerContainer())

    container
      .bind<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.Revisions_CrossServiceTokenDecoder)
      .toDynamicValue((context: interfaces.Context) => {
        return new TokenDecoder<CrossServiceTokenData>(context.container.get(TYPES.Revisions_AUTH_JWT_SECRET))
      })

    container
      .bind<ApiGatewayAuthMiddleware>(TYPES.Revisions_ApiGatewayAuthMiddleware)
      .toDynamicValue((context: interfaces.Context) => {
        return new ApiGatewayAuthMiddleware(
          context.container.get(TYPES.Revisions_CrossServiceTokenDecoder),
          context.container.get(TYPES.Revisions_Logger),
        )
      })

    // Handlers
    container
      .bind<ItemDumpedEventHandler>(TYPES.Revisions_ItemDumpedEventHandler)
      .toConstantValue(
        new ItemDumpedEventHandler(
          container.get<CreateRevisionFromDump>(TYPES.Revisions_CreateRevisionFromDump),
          container.get<winston.Logger>(TYPES.Revisions_Logger),
        ),
      )
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.Revisions_AccountDeletionRequestedEventHandler)
      .toConstantValue(
        new AccountDeletionRequestedEventHandler(
          container.get<RevisionRepositoryResolverInterface>(TYPES.Revisions_RevisionRepositoryResolver),
          container.get<winston.Logger>(TYPES.Revisions_Logger),
        ),
      )
    container
      .bind<RevisionsCopyRequestedEventHandler>(TYPES.Revisions_RevisionsCopyRequestedEventHandler)
      .toConstantValue(
        new RevisionsCopyRequestedEventHandler(
          container.get<CopyRevisions>(TYPES.Revisions_CopyRevisions),
          container.get<winston.Logger>(TYPES.Revisions_Logger),
        ),
      )
    container
      .bind<ItemRemovedFromSharedVaultEventHandler>(TYPES.Revisions_ItemRemovedFromSharedVaultEventHandler)
      .toConstantValue(
        new ItemRemovedFromSharedVaultEventHandler(
          container.get<RemoveRevisionsFromSharedVault>(TYPES.Revisions_RemoveRevisionsFromSharedVault),
          container.get<winston.Logger>(TYPES.Revisions_Logger),
        ),
      )
    container
      .bind<TransitionRequestedEventHandler>(TYPES.Revisions_TransitionRequestedEventHandler)
      .toConstantValue(
        new TransitionRequestedEventHandler(
          false,
          container.get<TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser>(
            TYPES.Revisions_TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser,
          ),
          container.get<winston.Logger>(TYPES.Revisions_Logger),
        ),
      )
    container
      .bind<SharedVaultRemovedEventHandler>(TYPES.Revisions_SharedVaultRemovedEventHandler)
      .toConstantValue(
        new SharedVaultRemovedEventHandler(
          container.get<RemoveRevisionsFromSharedVault>(TYPES.Revisions_RemoveRevisionsFromSharedVault),
          container.get<winston.Logger>(TYPES.Revisions_Logger),
        ),
      )

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['ITEM_DUMPED', container.get(TYPES.Revisions_ItemDumpedEventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.Revisions_AccountDeletionRequestedEventHandler)],
      ['REVISIONS_COPY_REQUESTED', container.get(TYPES.Revisions_RevisionsCopyRequestedEventHandler)],
      ['ITEM_REMOVED_FROM_SHARED_VAULT', container.get(TYPES.Revisions_ItemRemovedFromSharedVaultEventHandler)],
      ['TRANSITION_REQUESTED', container.get(TYPES.Revisions_TransitionRequestedEventHandler)],
      ['SHARED_VAULT_REMOVED', container.get(TYPES.Revisions_SharedVaultRemovedEventHandler)],
    ])

    if (isConfiguredForHomeServer) {
      const directCallEventMessageHandler = new DirectCallEventMessageHandler(
        eventHandlers,
        container.get(TYPES.Revisions_Logger),
      )
      directCallDomainEventPublisher.register(directCallEventMessageHandler)
      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.Revisions_DomainEventMessageHandler)
        .toConstantValue(directCallEventMessageHandler)
    } else {
      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.Revisions_DomainEventMessageHandler)
        .toConstantValue(
          isConfiguredForHomeServerOrSelfHosting
            ? new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Revisions_Logger))
            : new SQSOpenTelemetryEventMessageHandler(eventHandlers, container.get(TYPES.Revisions_Logger)),
        )

      container
        .bind<DomainEventSubscriberFactoryInterface>(TYPES.Revisions_DomainEventSubscriberFactory)
        .toDynamicValue((context: interfaces.Context) => {
          return new SQSDomainEventSubscriberFactory(
            context.container.get(TYPES.Revisions_SQS),
            context.container.get(TYPES.Revisions_SQS_QUEUE_URL),
            context.container.get(TYPES.Revisions_DomainEventMessageHandler),
          )
        })
    }

    // Inversify Controllers
    if (isConfiguredForHomeServer) {
      container
        .bind<BaseRevisionsController>(TYPES.Revisions_BaseRevisionsController)
        .toConstantValue(
          new BaseRevisionsController(
            container.get<GetRevisionsMetada>(TYPES.Revisions_GetRevisionsMetada),
            container.get<GetRevision>(TYPES.Revisions_GetRevision),
            container.get<DeleteRevision>(TYPES.Revisions_DeleteRevision),
            container.get<RevisionHttpMapper>(TYPES.Revisions_RevisionHttpMapper),
            container.get<RevisionMetadataHttpMapper>(TYPES.Revisions_RevisionMetadataHttpMapper),
            container.get<ControllerContainerInterface>(TYPES.Revisions_ControllerContainer),
          ),
        )
    }

    logger.debug('Configuration complete')

    return container
  }
}
