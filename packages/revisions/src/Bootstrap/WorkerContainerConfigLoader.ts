import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { S3Client } from '@aws-sdk/client-s3'
import { DomainEventHandlerInterface } from '@standardnotes/domain-events'
import {
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import * as winston from 'winston'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicFormatter = require('@newrelic/winston-enricher')

import TYPES from './Types'
import { RevisionItemStringMapper } from '../Mapping/RevisionItemStringMapper'
import { ItemDumpedEventHandler } from '../Domain/Handler/ItemDumpedEventHandler'
import { S3DumpRepository } from '../Infra/S3/S3ItemDumpRepository'
import { FSDumpRepository } from '../Infra/FS/FSDumpRepository'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { RevisionsCopyRequestedEventHandler } from '../Domain/Handler/RevisionsCopyRequestedEventHandler'
import { CopyRevisions } from '../Domain/UseCase/CopyRevisions/CopyRevisions'
import { RevisionsOwnershipUpdateRequestedEventHandler } from '../Domain/Handler/RevisionsOwnershipUpdateRequestedEventHandler'
import { Env } from './Env'
import { SimpleContainer } from './SimpleContainer'
import { MySQLRevisionRepository } from '../Infra/MySQL/MySQLRevisionRepository'
import { AppDataSource } from './DataSource'
import { TypeORMRevision } from '../Infra/TypeORM/TypeORMRevision'
import { RevisionPersistenceMapper } from '../Mapping/RevisionPersistenceMapper'
import { RevisionMetadataPersistenceMapper } from '../Mapping/RevisionMetadataPersistenceMapper'

export class WorkerContainerConfigLoader {
  async load(): Promise<SimpleContainer> {
    const env: Env = new Env()
    env.load()

    await AppDataSource.initialize()

    const simpleContainer = new SimpleContainer()

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

    simpleContainer.set(TYPES.Logger, logger)

    simpleContainer.set(TYPES.RevisionMetadataPersistenceMapper, new RevisionMetadataPersistenceMapper())

    simpleContainer.set(TYPES.RevisionPersistenceMapper, new RevisionPersistenceMapper())

    simpleContainer.set(TYPES.ORMRevisionRepository, AppDataSource.getRepository(TypeORMRevision))

    simpleContainer.set(
      TYPES.RevisionRepository,
      new MySQLRevisionRepository(
        simpleContainer.get(TYPES.ORMRevisionRepository),
        simpleContainer.get(TYPES.RevisionMetadataPersistenceMapper),
        simpleContainer.get(TYPES.RevisionPersistenceMapper),
        simpleContainer.get(TYPES.Logger),
      ),
    )

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

    simpleContainer.set(TYPES.SQS, new SQSClient(sqsConfig))

    let s3Client = undefined
    if (env.get('S3_AWS_REGION', true)) {
      s3Client = new S3Client({
        apiVersion: 'latest',
        region: env.get('S3_AWS_REGION', true),
      })
    }

    simpleContainer.set(TYPES.S3, s3Client)

    simpleContainer.set(TYPES.RevisionItemStringMapper, new RevisionItemStringMapper())

    simpleContainer.set(TYPES.NEW_RELIC_ENABLED, env.get('NEW_RELIC_ENABLED', true))
    simpleContainer.set(TYPES.VERSION, env.get('VERSION'))
    simpleContainer.set(TYPES.SQS_QUEUE_URL, env.get('SQS_QUEUE_URL'))
    simpleContainer.set(TYPES.S3_AWS_REGION, env.get('S3_AWS_REGION', true))
    simpleContainer.set(TYPES.S3_BACKUP_BUCKET_NAME, env.get('S3_BACKUP_BUCKET_NAME', true))

    const dumpRepository = env.get('S3_AWS_REGION', true)
      ? new S3DumpRepository(
          simpleContainer.get(TYPES.S3_BACKUP_BUCKET_NAME),
          simpleContainer.get(TYPES.S3),
          simpleContainer.get(TYPES.RevisionItemStringMapper),
        )
      : new FSDumpRepository(simpleContainer.get(TYPES.RevisionItemStringMapper))

    simpleContainer.set(TYPES.DumpRepository, dumpRepository)

    simpleContainer.set(TYPES.CopyRevisions, new CopyRevisions(simpleContainer.get(TYPES.RevisionRepository)))

    simpleContainer.set(
      TYPES.ItemDumpedEventHandler,
      new ItemDumpedEventHandler(
        simpleContainer.get(TYPES.DumpRepository),
        simpleContainer.get(TYPES.RevisionRepository),
      ),
    )

    simpleContainer.set(
      TYPES.AccountDeletionRequestedEventHandler,
      new AccountDeletionRequestedEventHandler(
        simpleContainer.get(TYPES.RevisionRepository),
        simpleContainer.get(TYPES.Logger),
      ),
    )

    simpleContainer.set(
      TYPES.RevisionsCopyRequestedEventHandler,
      new RevisionsCopyRequestedEventHandler(
        simpleContainer.get(TYPES.CopyRevisions),
        simpleContainer.get(TYPES.Logger),
      ),
    )

    simpleContainer.set(
      TYPES.RevisionsOwnershipUpdateRequestedEventHandler,
      new RevisionsOwnershipUpdateRequestedEventHandler(simpleContainer.get(TYPES.RevisionRepository)),
    )

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['ITEM_DUMPED', simpleContainer.get(TYPES.ItemDumpedEventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', simpleContainer.get(TYPES.AccountDeletionRequestedEventHandler)],
      ['REVISIONS_COPY_REQUESTED', simpleContainer.get(TYPES.RevisionsCopyRequestedEventHandler)],
      [
        'REVISIONS_OWNERSHIP_UPDATE_REQUESTED',
        simpleContainer.get(TYPES.RevisionsOwnershipUpdateRequestedEventHandler),
      ],
    ])

    const handler =
      env.get('NEW_RELIC_ENABLED', true) === 'true'
        ? new SQSNewRelicEventMessageHandler(eventHandlers, simpleContainer.get(TYPES.Logger))
        : new SQSEventMessageHandler(eventHandlers, simpleContainer.get(TYPES.Logger))

    simpleContainer.set(TYPES.DomainEventMessageHandler, handler)

    simpleContainer.set(
      TYPES.DomainEventSubscriberFactory,
      new SQSDomainEventSubscriberFactory(
        simpleContainer.get(TYPES.SQS),
        simpleContainer.get(TYPES.SQS_QUEUE_URL),
        simpleContainer.get(TYPES.DomainEventMessageHandler),
      ),
    )

    return simpleContainer
  }
}
