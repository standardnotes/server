import * as winston from 'winston'
import Redis from 'ioredis'
import * as AWS from 'aws-sdk'
import { Container } from 'inversify'
import { Repository } from 'typeorm'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import { TokenDecoderInterface, CrossServiceTokenData, TokenDecoder } from '@standardnotes/security'
import {
  RedisDomainEventSubscriberFactory,
  RedisEventMessageHandler,
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { MapperInterface } from '@standardnotes/domain-core'

import { Env } from './Env'
import TYPES from './Types'
import { AppDataSource } from './DataSource'
import { InversifyExpressApiGatewayAuthMiddleware } from '../Infra/InversifyExpress/InversifyExpressApiGatewayAuthMiddleware'
import { RevisionsController } from '../Controller/RevisionsController'
import { GetRevisionsMetada } from '../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'
import { RevisionRepositoryInterface } from '../Domain/Revision/RevisionRepositoryInterface'
import { MySQLRevisionRepository } from '../Infra/MySQL/MySQLRevisionRepository'
import { RevisionMetadataPersistenceMapper } from '../Mapping/RevisionMetadataPersistenceMapper'
import { TypeORMRevision } from '../Infra/TypeORM/TypeORMRevision'
import { RevisionMetadata } from '../Domain/Revision/RevisionMetadata'
import { Revision } from '../Domain/Revision/Revision'
import { RevisionItemStringMapper } from '../Mapping/RevisionItemStringMapper'
import { RevisionPersistenceMapper } from '../Mapping/RevisionPersistenceMapper'
import { ItemDumpedEventHandler } from '../Domain/Handler/ItemDumpedEventHandler'
import { DumpRepositoryInterface } from '../Domain/Dump/DumpRepositoryInterface'
import { S3DumpRepository } from '../Infra/S3/S3ItemDumpRepository'
import { FSDumpRepository } from '../Infra/FS/FSDumpRepository'
import { GetRevision } from '../Domain/UseCase/GetRevision/GetRevision'
import { DeleteRevision } from '../Domain/UseCase/DeleteRevision/DeleteRevision'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { RevisionsCopyRequestedEventHandler } from '../Domain/Handler/RevisionsCopyRequestedEventHandler'
import { CopyRevisions } from '../Domain/UseCase/CopyRevisions/CopyRevisions'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicFormatter = require('@newrelic/winston-enricher')

export class ContainerConfigLoader {
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

    if (env.get('SQS_QUEUE_URL', true)) {
      const sqsConfig: AWS.SQS.Types.ClientConfiguration = {
        apiVersion: 'latest',
        region: env.get('SQS_AWS_REGION', true),
      }
      if (env.get('SQS_ACCESS_KEY_ID', true) && env.get('SQS_SECRET_ACCESS_KEY', true)) {
        sqsConfig.credentials = {
          accessKeyId: env.get('SQS_ACCESS_KEY_ID', true),
          secretAccessKey: env.get('SQS_SECRET_ACCESS_KEY', true),
        }
      }
      container.bind<AWS.SQS>(TYPES.SQS).toConstantValue(new AWS.SQS(sqsConfig))
    }

    let s3Client = undefined
    if (env.get('S3_AWS_REGION', true)) {
      s3Client = new AWS.S3({
        apiVersion: 'latest',
        region: env.get('S3_AWS_REGION', true),
      })
    }
    container.bind<AWS.S3 | undefined>(TYPES.S3).toConstantValue(s3Client)

    // Map
    container
      .bind<MapperInterface<RevisionMetadata, TypeORMRevision>>(TYPES.RevisionMetadataPersistenceMapper)
      .toConstantValue(new RevisionMetadataPersistenceMapper())
    container
      .bind<MapperInterface<Revision, TypeORMRevision>>(TYPES.RevisionPersistenceMapper)
      .toConstantValue(new RevisionPersistenceMapper())
    container
      .bind<MapperInterface<Revision, string>>(TYPES.RevisionItemStringMapper)
      .toConstantValue(new RevisionItemStringMapper())

    // ORM
    container
      .bind<Repository<TypeORMRevision>>(TYPES.ORMRevisionRepository)
      .toConstantValue(AppDataSource.getRepository(TypeORMRevision))

    // env vars
    container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL', true))
    container.bind(TYPES.REDIS_EVENTS_CHANNEL).toConstantValue(env.get('REDIS_EVENTS_CHANNEL'))
    container.bind(TYPES.AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container.bind(TYPES.S3_AWS_REGION).toConstantValue(env.get('S3_AWS_REGION', true))
    container.bind(TYPES.S3_BACKUP_BUCKET_NAME).toConstantValue(env.get('S3_BACKUP_BUCKET_NAME', true))
    container.bind(TYPES.NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))

    // Repositories
    container
      .bind<RevisionRepositoryInterface>(TYPES.RevisionRepository)
      .toConstantValue(
        new MySQLRevisionRepository(
          container.get(TYPES.ORMRevisionRepository),
          container.get(TYPES.RevisionMetadataPersistenceMapper),
          container.get(TYPES.RevisionPersistenceMapper),
        ),
      )
    if (env.get('S3_AWS_REGION', true)) {
      container
        .bind<DumpRepositoryInterface>(TYPES.DumpRepository)
        .toConstantValue(
          new S3DumpRepository(
            container.get(TYPES.S3_BACKUP_BUCKET_NAME),
            container.get(TYPES.S3),
            container.get(TYPES.RevisionItemStringMapper),
          ),
        )
    } else {
      container
        .bind<DumpRepositoryInterface>(TYPES.DumpRepository)
        .toConstantValue(new FSDumpRepository(container.get(TYPES.RevisionItemStringMapper)))
    }

    // use cases
    container
      .bind<GetRevisionsMetada>(TYPES.GetRevisionsMetada)
      .toConstantValue(new GetRevisionsMetada(container.get(TYPES.RevisionRepository)))
    container
      .bind<GetRevision>(TYPES.GetRevision)
      .toConstantValue(new GetRevision(container.get(TYPES.RevisionRepository)))
    container
      .bind<DeleteRevision>(TYPES.DeleteRevision)
      .toConstantValue(new DeleteRevision(container.get(TYPES.RevisionRepository)))
    container
      .bind<CopyRevisions>(TYPES.CopyRevisions)
      .toConstantValue(new CopyRevisions(container.get(TYPES.RevisionRepository)))

    // Controller
    container
      .bind<RevisionsController>(TYPES.RevisionsController)
      .toConstantValue(
        new RevisionsController(
          container.get(TYPES.GetRevisionsMetada),
          container.get(TYPES.GetRevision),
          container.get(TYPES.DeleteRevision),
          container.get(TYPES.Logger),
        ),
      )

    // Handlers
    container
      .bind<ItemDumpedEventHandler>(TYPES.ItemDumpedEventHandler)
      .toConstantValue(
        new ItemDumpedEventHandler(container.get(TYPES.DumpRepository), container.get(TYPES.RevisionRepository)),
      )
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.AccountDeletionRequestedEventHandler)
      .toConstantValue(
        new AccountDeletionRequestedEventHandler(container.get(TYPES.RevisionRepository), container.get(TYPES.Logger)),
      )
    container
      .bind<RevisionsCopyRequestedEventHandler>(TYPES.RevisionsCopyRequestedEventHandler)
      .toConstantValue(
        new RevisionsCopyRequestedEventHandler(container.get(TYPES.CopyRevisions), container.get(TYPES.Logger)),
      )

    // Services
    container
      .bind<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.CrossServiceTokenDecoder)
      .toConstantValue(new TokenDecoder<CrossServiceTokenData>(container.get(TYPES.AUTH_JWT_SECRET)))

    // Middleware
    container
      .bind<InversifyExpressApiGatewayAuthMiddleware>(TYPES.ApiGatewayAuthMiddleware)
      .to(InversifyExpressApiGatewayAuthMiddleware)

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['ITEM_DUMPED', container.get(TYPES.ItemDumpedEventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.AccountDeletionRequestedEventHandler)],
      ['REVISIONS_COPY_REQUESTED', container.get(TYPES.RevisionsCopyRequestedEventHandler)],
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

    return container
  }
}
