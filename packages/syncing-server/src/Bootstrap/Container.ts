import * as winston from 'winston'
import Redis from 'ioredis'
import * as AWS from 'aws-sdk'
import { Container } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import {
  AnalyticsStoreInterface,
  PeriodKeyGenerator,
  RedisAnalyticsStore,
  RedisStatisticsStore,
  StatisticsStoreInterface,
} from '@standardnotes/analytics'

import { Env } from './Env'
import TYPES from './Types'
import { AuthMiddleware } from '../Controller/AuthMiddleware'
import { MySQLRevisionRepository } from '../Infra/MySQL/MySQLRevisionRepository'
import { Item } from '../Domain/Item/Item'
import { Revision } from '../Domain/Revision/Revision'
import { RevisionProjector } from '../Projection/RevisionProjector'
import { MySQLItemRepository } from '../Infra/MySQL/MySQLItemRepository'
import { ContentDecoder } from '../Domain/Item/ContentDecoder'
import { DomainEventFactory } from '../Domain/Event/DomainEventFactory'
import { SyncResponseFactory20161215 } from '../Domain/Item/SyncResponse/SyncResponseFactory20161215'
import { SyncResponseFactory20200115 } from '../Domain/Item/SyncResponse/SyncResponseFactory20200115'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { SyncResponseFactoryResolver } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolver'
import { ItemServiceInterface } from '../Domain/Item/ItemServiceInterface'
import { ItemService } from '../Domain/Item/ItemService'
import { AuthHttpServiceInterface } from '../Domain/Auth/AuthHttpServiceInterface'
import { AuthHttpService } from '../Infra/HTTP/AuthHttpService'
import { SyncItems } from '../Domain/UseCase/SyncItems'
import { ExtensionsHttpServiceInterface } from '../Domain/Extension/ExtensionsHttpServiceInterface'
import { ExtensionsHttpService } from '../Domain/Extension/ExtensionsHttpService'
import { ItemBackupServiceInterface } from '../Domain/Item/ItemBackupServiceInterface'
import { S3ItemBackupService } from '../Infra/S3/S3ItemBackupService'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { ItemsSyncedEventHandler } from '../Domain/Handler/ItemsSyncedEventHandler'
import { EmailArchiveExtensionSyncedEventHandler } from '../Domain/Handler/EmailArchiveExtensionSyncedEventHandler'
import { RevisionServiceInterface } from '../Domain/Revision/RevisionServiceInterface'
import { RevisionService } from '../Domain/Revision/RevisionService'
import { DuplicateItemSyncedEventHandler } from '../Domain/Handler/DuplicateItemSyncedEventHandler'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { ItemProjector } from '../Projection/ItemProjector'
import { ItemConflictProjector } from '../Projection/ItemConflictProjector'
import { Timer, TimerInterface } from '@standardnotes/time'
import { ItemSaveValidatorInterface } from '../Domain/Item/SaveValidator/ItemSaveValidatorInterface'
import { ItemSaveValidator } from '../Domain/Item/SaveValidator/ItemSaveValidator'
import { OwnershipFilter } from '../Domain/Item/SaveRule/OwnershipFilter'
import { TimeDifferenceFilter } from '../Domain/Item/SaveRule/TimeDifferenceFilter'
import { ItemFactoryInterface } from '../Domain/Item/ItemFactoryInterface'
import { ItemFactory } from '../Domain/Item/ItemFactory'
import axios, { AxiosInstance } from 'axios'
import { UuidFilter } from '../Domain/Item/SaveRule/UuidFilter'
import { ContentTypeFilter } from '../Domain/Item/SaveRule/ContentTypeFilter'
import { ContentFilter } from '../Domain/Item/SaveRule/ContentFilter'
import {
  RedisDomainEventPublisher,
  RedisDomainEventSubscriberFactory,
  RedisEventMessageHandler,
  SNSDomainEventPublisher,
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { EmailBackupRequestedEventHandler } from '../Domain/Handler/EmailBackupRequestedEventHandler'
import { CloudBackupRequestedEventHandler } from '../Domain/Handler/CloudBackupRequestedEventHandler'
import { CheckIntegrity } from '../Domain/UseCase/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../Domain/UseCase/GetItem/GetItem'
import { ItemTransferCalculatorInterface } from '../Domain/Item/ItemTransferCalculatorInterface'
import { ItemTransferCalculator } from '../Domain/Item/ItemTransferCalculator'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { SavedItemProjection } from '../Projection/SavedItemProjection'
import { SavedItemProjector } from '../Projection/SavedItemProjector'
import { ItemProjection } from '../Projection/ItemProjection'
import { RevisionProjection } from '../Projection/RevisionProjection'
import { ItemConflict } from '../Domain/Item/ItemConflict'
import { ItemConflictProjection } from '../Projection/ItemConflictProjection'
import { AppDataSource } from './DataSource'
import { RevisionRepositoryInterface } from '../Domain/Revision/RevisionRepositoryInterface'
import { ItemRepositoryInterface } from '../Domain/Item/ItemRepositoryInterface'
import { Repository } from 'typeorm'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicFormatter = require('@newrelic/winston-enricher')

export class ContainerConfigLoader {
  private readonly DEFAULT_CONTENT_SIZE_TRANSFER_LIMIT = 10_000_000
  private readonly DEFAULT_MAX_ITEMS_LIMIT = 300

  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

    await AppDataSource.initialize()

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

    if (env.get('SNS_AWS_REGION', true)) {
      container.bind<AWS.SNS>(TYPES.SNS).toConstantValue(
        new AWS.SNS({
          apiVersion: 'latest',
          region: env.get('SNS_AWS_REGION', true),
        }),
      )
    }

    if (env.get('SQS_AWS_REGION', true)) {
      container.bind<AWS.SQS>(TYPES.SQS).toConstantValue(
        new AWS.SQS({
          apiVersion: 'latest',
          region: env.get('SQS_AWS_REGION', true),
        }),
      )
    }

    let s3Client = undefined
    if (env.get('S3_AWS_REGION', true)) {
      s3Client = new AWS.S3({
        apiVersion: 'latest',
        region: env.get('S3_AWS_REGION', true),
      })
    }
    container.bind<AWS.S3 | undefined>(TYPES.S3).toConstantValue(s3Client)

    // Repositories
    container.bind<RevisionRepositoryInterface>(TYPES.RevisionRepository).to(MySQLRevisionRepository)
    container.bind<ItemRepositoryInterface>(TYPES.ItemRepository).to(MySQLItemRepository)

    // ORM
    container
      .bind<Repository<Revision>>(TYPES.ORMRevisionRepository)
      .toConstantValue(AppDataSource.getRepository(Revision))
    container.bind<Repository<Item>>(TYPES.ORMItemRepository).toConstantValue(AppDataSource.getRepository(Item))

    // Middleware
    container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)

    // Projectors
    container.bind<ProjectorInterface<Revision, RevisionProjection>>(TYPES.RevisionProjector).to(RevisionProjector)
    container.bind<ProjectorInterface<Item, ItemProjection>>(TYPES.ItemProjector).to(ItemProjector)
    container.bind<ProjectorInterface<Item, SavedItemProjection>>(TYPES.SavedItemProjector).to(SavedItemProjector)
    container
      .bind<ProjectorInterface<ItemConflict, ItemConflictProjection>>(TYPES.ItemConflictProjector)
      .to(ItemConflictProjector)

    // env vars
    container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
    container.bind(TYPES.SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN', true))
    container.bind(TYPES.SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL', true))
    container.bind(TYPES.REDIS_EVENTS_CHANNEL).toConstantValue(env.get('REDIS_EVENTS_CHANNEL'))
    container.bind(TYPES.AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container
      .bind(TYPES.INTERNAL_DNS_REROUTE_ENABLED)
      .toConstantValue(env.get('INTERNAL_DNS_REROUTE_ENABLED', true) === 'true')
    container.bind(TYPES.EXTENSIONS_SERVER_URL).toConstantValue(env.get('EXTENSIONS_SERVER_URL', true))
    container.bind(TYPES.AUTH_SERVER_URL).toConstantValue(env.get('AUTH_SERVER_URL'))
    container.bind(TYPES.S3_AWS_REGION).toConstantValue(env.get('S3_AWS_REGION', true))
    container.bind(TYPES.S3_BACKUP_BUCKET_NAME).toConstantValue(env.get('S3_BACKUP_BUCKET_NAME', true))
    container.bind(TYPES.EMAIL_ATTACHMENT_MAX_BYTE_SIZE).toConstantValue(env.get('EMAIL_ATTACHMENT_MAX_BYTE_SIZE'))
    container.bind(TYPES.REVISIONS_FREQUENCY).toConstantValue(env.get('REVISIONS_FREQUENCY'))
    container.bind(TYPES.NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))
    container
      .bind(TYPES.CONTENT_SIZE_TRANSFER_LIMIT)
      .toConstantValue(+env.get('CONTENT_SIZE_TRANSFER_LIMIT', true) ?? this.DEFAULT_CONTENT_SIZE_TRANSFER_LIMIT)
    container
      .bind(TYPES.MAX_ITEMS_LIMIT)
      .toConstantValue(+env.get('MAX_ITEMS_LIMIT', true) ?? this.DEFAULT_MAX_ITEMS_LIMIT)

    // use cases
    container.bind<SyncItems>(TYPES.SyncItems).to(SyncItems)
    container.bind<CheckIntegrity>(TYPES.CheckIntegrity).to(CheckIntegrity)
    container.bind<GetItem>(TYPES.GetItem).to(GetItem)

    // Handlers
    container.bind<ItemsSyncedEventHandler>(TYPES.ItemsSyncedEventHandler).to(ItemsSyncedEventHandler)
    container
      .bind<EmailArchiveExtensionSyncedEventHandler>(TYPES.EmailArchiveExtensionSyncedEventHandler)
      .to(EmailArchiveExtensionSyncedEventHandler)
    container
      .bind<DuplicateItemSyncedEventHandler>(TYPES.DuplicateItemSyncedEventHandler)
      .to(DuplicateItemSyncedEventHandler)
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.AccountDeletionRequestedEventHandler)
      .to(AccountDeletionRequestedEventHandler)
    container
      .bind<EmailBackupRequestedEventHandler>(TYPES.EmailBackupRequestedEventHandler)
      .to(EmailBackupRequestedEventHandler)
    container
      .bind<CloudBackupRequestedEventHandler>(TYPES.CloudBackupRequestedEventHandler)
      .to(CloudBackupRequestedEventHandler)

    // Services
    container.bind<ContentDecoder>(TYPES.ContentDecoder).to(ContentDecoder)
    container.bind<DomainEventFactoryInterface>(TYPES.DomainEventFactory).to(DomainEventFactory)
    container.bind<AxiosInstance>(TYPES.HTTPClient).toConstantValue(axios.create())
    container.bind<ItemServiceInterface>(TYPES.ItemService).to(ItemService)
    container.bind<ItemTransferCalculatorInterface>(TYPES.ItemTransferCalculator).to(ItemTransferCalculator)
    container.bind<TimerInterface>(TYPES.Timer).toConstantValue(new Timer())
    container.bind<SyncResponseFactory20161215>(TYPES.SyncResponseFactory20161215).to(SyncResponseFactory20161215)
    container.bind<SyncResponseFactory20200115>(TYPES.SyncResponseFactory20200115).to(SyncResponseFactory20200115)
    container
      .bind<SyncResponseFactoryResolverInterface>(TYPES.SyncResponseFactoryResolver)
      .to(SyncResponseFactoryResolver)
    container.bind<AuthHttpServiceInterface>(TYPES.AuthHttpService).to(AuthHttpService)
    container.bind<ExtensionsHttpServiceInterface>(TYPES.ExtensionsHttpService).to(ExtensionsHttpService)
    container.bind<ItemBackupServiceInterface>(TYPES.ItemBackupService).to(S3ItemBackupService)
    container.bind<RevisionServiceInterface>(TYPES.RevisionService).to(RevisionService)
    const periodKeyGenerator = new PeriodKeyGenerator()
    container
      .bind<AnalyticsStoreInterface>(TYPES.AnalyticsStore)
      .toConstantValue(new RedisAnalyticsStore(periodKeyGenerator, container.get(TYPES.Redis)))
    container
      .bind<StatisticsStoreInterface>(TYPES.StatisticsStore)
      .toConstantValue(new RedisStatisticsStore(periodKeyGenerator, container.get(TYPES.Redis)))

    if (env.get('SNS_TOPIC_ARN', true)) {
      container
        .bind<SNSDomainEventPublisher>(TYPES.DomainEventPublisher)
        .toConstantValue(new SNSDomainEventPublisher(container.get(TYPES.SNS), container.get(TYPES.SNS_TOPIC_ARN)))
    } else {
      container
        .bind<RedisDomainEventPublisher>(TYPES.DomainEventPublisher)
        .toConstantValue(
          new RedisDomainEventPublisher(container.get(TYPES.Redis), container.get(TYPES.REDIS_EVENTS_CHANNEL)),
        )
    }

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['DUPLICATE_ITEM_SYNCED', container.get(TYPES.DuplicateItemSyncedEventHandler)],
      ['ITEMS_SYNCED', container.get(TYPES.ItemsSyncedEventHandler)],
      ['EMAIL_ARCHIVE_EXTENSION_SYNCED', container.get(TYPES.EmailArchiveExtensionSyncedEventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.AccountDeletionRequestedEventHandler)],
      ['EMAIL_BACKUP_REQUESTED', container.get(TYPES.EmailBackupRequestedEventHandler)],
      ['CLOUD_BACKUP_REQUESTED', container.get(TYPES.CloudBackupRequestedEventHandler)],
    ])

    if (env.get('SQS_QUEUE_URL', true)) {
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
    } else {
      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler)
        .toConstantValue(new RedisEventMessageHandler(eventHandlers, container.get(TYPES.Logger)))
      container
        .bind<DomainEventSubscriberFactoryInterface>(TYPES.DomainEventSubscriberFactory)
        .toConstantValue(
          new RedisDomainEventSubscriberFactory(
            container.get(TYPES.Redis),
            container.get(TYPES.DomainEventMessageHandler),
            container.get(TYPES.REDIS_EVENTS_CHANNEL),
          ),
        )
    }

    container.bind<ItemFactoryInterface>(TYPES.ItemFactory).to(ItemFactory)

    container.bind<OwnershipFilter>(TYPES.OwnershipFilter).to(OwnershipFilter)
    container.bind<TimeDifferenceFilter>(TYPES.TimeDifferenceFilter).to(TimeDifferenceFilter)
    container.bind<UuidFilter>(TYPES.UuidFilter).to(UuidFilter)
    container.bind<ContentTypeFilter>(TYPES.ContentTypeFilter).to(ContentTypeFilter)
    container.bind<ContentFilter>(TYPES.ContentFilter).to(ContentFilter)

    container
      .bind<ItemSaveValidatorInterface>(TYPES.ItemSaveValidator)
      .toConstantValue(
        new ItemSaveValidator([
          container.get(TYPES.OwnershipFilter),
          container.get(TYPES.TimeDifferenceFilter),
          container.get(TYPES.UuidFilter),
          container.get(TYPES.ContentTypeFilter),
          container.get(TYPES.ContentFilter),
        ]),
      )

    return container
  }
}
