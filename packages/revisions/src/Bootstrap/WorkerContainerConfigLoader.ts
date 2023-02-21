import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { S3Client } from '@aws-sdk/client-s3'
import { Container, interfaces } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import {
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { MapperInterface } from '@standardnotes/domain-core'

import TYPES from './Types'
import { Revision } from '../Domain/Revision/Revision'
import { RevisionItemStringMapper } from '../Mapping/RevisionItemStringMapper'
import { ItemDumpedEventHandler } from '../Domain/Handler/ItemDumpedEventHandler'
import { DumpRepositoryInterface } from '../Domain/Dump/DumpRepositoryInterface'
import { S3DumpRepository } from '../Infra/S3/S3ItemDumpRepository'
import { FSDumpRepository } from '../Infra/FS/FSDumpRepository'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { RevisionsCopyRequestedEventHandler } from '../Domain/Handler/RevisionsCopyRequestedEventHandler'
import { CopyRevisions } from '../Domain/UseCase/CopyRevisions/CopyRevisions'
import { CommonContainerConfigLoader } from './CommonContainerConfigLoader'
import { Env } from './Env'

export class WorkerContainerConfigLoader extends CommonContainerConfigLoader {
  override async load(): Promise<Container> {
    const container = await super.load()

    const env: Env = container.get(TYPES.Env)

    container.bind<SQSClient>(TYPES.SQS).toDynamicValue((context: interfaces.Context) => {
      const env: Env = context.container.get(TYPES.Env)

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

    container.bind<S3Client | undefined>(TYPES.S3).toDynamicValue((context: interfaces.Context) => {
      const env: Env = context.container.get(TYPES.Env)

      let s3Client = undefined
      if (env.get('S3_AWS_REGION', true)) {
        s3Client = new S3Client({
          apiVersion: 'latest',
          region: env.get('S3_AWS_REGION', true),
        })
      }

      return s3Client
    })

    // Map
    container
      .bind<MapperInterface<Revision, string>>(TYPES.RevisionItemStringMapper)
      .toDynamicValue(() => new RevisionItemStringMapper())

    // env vars
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))
    container.bind(TYPES.S3_AWS_REGION).toConstantValue(env.get('S3_AWS_REGION', true))
    container.bind(TYPES.S3_BACKUP_BUCKET_NAME).toConstantValue(env.get('S3_BACKUP_BUCKET_NAME', true))

    container.bind<DumpRepositoryInterface>(TYPES.DumpRepository).toDynamicValue((context: interfaces.Context) => {
      const env: Env = context.container.get(TYPES.Env)

      if (env.get('S3_AWS_REGION', true)) {
        return new S3DumpRepository(
          context.container.get(TYPES.S3_BACKUP_BUCKET_NAME),
          context.container.get(TYPES.S3),
          context.container.get(TYPES.RevisionItemStringMapper),
        )
      } else {
        return new FSDumpRepository(context.container.get(TYPES.RevisionItemStringMapper))
      }
    })

    // use cases
    container.bind<CopyRevisions>(TYPES.CopyRevisions).toDynamicValue((context: interfaces.Context) => {
      return new CopyRevisions(context.container.get(TYPES.RevisionRepository))
    })

    // Handlers
    container
      .bind<ItemDumpedEventHandler>(TYPES.ItemDumpedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemDumpedEventHandler(
          context.container.get(TYPES.DumpRepository),
          context.container.get(TYPES.RevisionRepository),
        )
      })
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.AccountDeletionRequestedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new AccountDeletionRequestedEventHandler(
          context.container.get(TYPES.RevisionRepository),
          context.container.get(TYPES.Logger),
        )
      })
    container
      .bind<RevisionsCopyRequestedEventHandler>(TYPES.RevisionsCopyRequestedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new RevisionsCopyRequestedEventHandler(
          context.container.get(TYPES.CopyRevisions),
          context.container.get(TYPES.Logger),
        )
      })

    container
      .bind<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler)
      .toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Env)

        const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
          ['ITEM_DUMPED', context.container.get(TYPES.ItemDumpedEventHandler)],
          ['ACCOUNT_DELETION_REQUESTED', context.container.get(TYPES.AccountDeletionRequestedEventHandler)],
          ['REVISIONS_COPY_REQUESTED', context.container.get(TYPES.RevisionsCopyRequestedEventHandler)],
        ])

        const handler =
          env.get('NEW_RELIC_ENABLED', true) === 'true'
            ? new SQSNewRelicEventMessageHandler(eventHandlers, context.container.get(TYPES.Logger))
            : new SQSEventMessageHandler(eventHandlers, context.container.get(TYPES.Logger))

        return handler
      })

    container
      .bind<DomainEventSubscriberFactoryInterface>(TYPES.DomainEventSubscriberFactory)
      .toDynamicValue((context: interfaces.Context) => {
        return new SQSDomainEventSubscriberFactory(
          context.container.get(TYPES.SQS),
          context.container.get(TYPES.SQS_QUEUE_URL),
          context.container.get(TYPES.DomainEventMessageHandler),
        )
      })

    return container
  }
}
