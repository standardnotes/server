import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { S3Client } from '@aws-sdk/client-s3'
import { Container, interfaces } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'

import { Env } from './Env'
import TYPES from './Types'
import { ContentDecoder } from '../Domain/Item/ContentDecoder'
import { AuthHttpServiceInterface } from '../Domain/Auth/AuthHttpServiceInterface'
import { AuthHttpService } from '../Infra/HTTP/AuthHttpService'
import { ExtensionsHttpServiceInterface } from '../Domain/Extension/ExtensionsHttpServiceInterface'
import { ExtensionsHttpService } from '../Domain/Extension/ExtensionsHttpService'
import { ItemBackupServiceInterface } from '../Domain/Item/ItemBackupServiceInterface'
import { S3ItemBackupService } from '../Infra/S3/S3ItemBackupService'
import { DuplicateItemSyncedEventHandler } from '../Domain/Handler/DuplicateItemSyncedEventHandler'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios')
import { AxiosInstance } from 'axios'
import {
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { EmailBackupRequestedEventHandler } from '../Domain/Handler/EmailBackupRequestedEventHandler'
import { ItemRevisionCreationRequestedEventHandler } from '../Domain/Handler/ItemRevisionCreationRequestedEventHandler'
import { FSItemBackupService } from '../Infra/FS/FSItemBackupService'
import { CommonContainerConfigLoader } from './CommonContainerConfigLoader'
import { UserCredentialsChangedEventHandler } from '../Domain/Handler/UserCredentialsChangedEventHandler'
import { SharedVaultFileUploadedEventHandler } from '../Domain/Handler/SharedVaultFileUploadedEventHandler'
import { SharedVaultFileRemovedEventHandler } from '../Domain/Handler/SharedVaultFileRemovedEventHandler'

export class WorkerContainerConfigLoader extends CommonContainerConfigLoader {
  private readonly DEFAULT_FILE_UPLOAD_PATH = `${__dirname}/../../uploads`

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

    // env vars
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))
    container.bind(TYPES.EXTENSIONS_SERVER_URL).toConstantValue(env.get('EXTENSIONS_SERVER_URL', true))
    container.bind(TYPES.AUTH_SERVER_URL).toConstantValue(env.get('AUTH_SERVER_URL'))
    container.bind(TYPES.S3_AWS_REGION).toConstantValue(env.get('S3_AWS_REGION', true))
    container.bind(TYPES.S3_BACKUP_BUCKET_NAME).toConstantValue(env.get('S3_BACKUP_BUCKET_NAME', true))
    container.bind(TYPES.EMAIL_ATTACHMENT_MAX_BYTE_SIZE).toConstantValue(env.get('EMAIL_ATTACHMENT_MAX_BYTE_SIZE'))
    container.bind(TYPES.NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))
    container
      .bind(TYPES.FILE_UPLOAD_PATH)
      .toConstantValue(
        env.get('FILE_UPLOAD_PATH', true) ? env.get('FILE_UPLOAD_PATH', true) : this.DEFAULT_FILE_UPLOAD_PATH,
      )

    // Handlers
    container
      .bind<DuplicateItemSyncedEventHandler>(TYPES.DuplicateItemSyncedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new DuplicateItemSyncedEventHandler(
          context.container.get(TYPES.ItemRepository),
          context.container.get(TYPES.DomainEventFactory),
          context.container.get(TYPES.DomainEventPublisher),
          context.container.get(TYPES.Logger),
        )
      })
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.AccountDeletionRequestedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new AccountDeletionRequestedEventHandler(
          context.container.get(TYPES.ItemRepository),
          context.container.get(TYPES.Logger),
        )
      })
    container
      .bind<EmailBackupRequestedEventHandler>(TYPES.EmailBackupRequestedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new EmailBackupRequestedEventHandler(
          context.container.get(TYPES.ItemRepository),
          context.container.get(TYPES.AuthHttpService),
          context.container.get(TYPES.ItemBackupService),
          context.container.get(TYPES.DomainEventPublisher),
          context.container.get(TYPES.DomainEventFactory),
          context.container.get(TYPES.EMAIL_ATTACHMENT_MAX_BYTE_SIZE),
          context.container.get(TYPES.ItemTransferCalculator),
          context.container.get(TYPES.S3_BACKUP_BUCKET_NAME),
          context.container.get(TYPES.Logger),
        )
      })
    container
      .bind<ItemRevisionCreationRequestedEventHandler>(TYPES.ItemRevisionCreationRequestedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemRevisionCreationRequestedEventHandler(
          context.container.get(TYPES.ItemRepository),
          context.container.get(TYPES.ItemBackupService),
          context.container.get(TYPES.DomainEventFactory),
          context.container.get(TYPES.DomainEventPublisher),
        )
      })

    container
      .bind<UserCredentialsChangedEventHandler>(TYPES.UserCredentialsChangedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new UserCredentialsChangedEventHandler(
          context.container.get(TYPES.ContactRepository),
          context.container.get(TYPES.SharedVaultInviteRepository),
          context.container.get(TYPES.Timer),
        )
      })

    container
      .bind<SharedVaultFileUploadedEventHandler>(TYPES.SharedVaultFileUploadedEventHandler)
      .to(SharedVaultFileUploadedEventHandler)
    container
      .bind<SharedVaultFileRemovedEventHandler>(TYPES.SharedVaultFileRemovedEventHandler)
      .to(SharedVaultFileRemovedEventHandler)

    // Services
    container.bind<ContentDecoder>(TYPES.ContentDecoder).toDynamicValue(() => new ContentDecoder())
    container.bind<AxiosInstance>(TYPES.HTTPClient).toDynamicValue(() => axios.create())
    container.bind<AuthHttpServiceInterface>(TYPES.AuthHttpService).toDynamicValue((context: interfaces.Context) => {
      return new AuthHttpService(context.container.get(TYPES.HTTPClient), context.container.get(TYPES.AUTH_SERVER_URL))
    })
    container
      .bind<ExtensionsHttpServiceInterface>(TYPES.ExtensionsHttpService)
      .toDynamicValue((context: interfaces.Context) => {
        return new ExtensionsHttpService(
          context.container.get(TYPES.HTTPClient),
          context.container.get(TYPES.ItemRepository),
          context.container.get(TYPES.ContentDecoder),
          context.container.get(TYPES.DomainEventPublisher),
          context.container.get(TYPES.DomainEventFactory),
          context.container.get(TYPES.Logger),
        )
      })

    container
      .bind<ItemBackupServiceInterface>(TYPES.ItemBackupService)
      .toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Env)

        if (env.get('S3_AWS_REGION', true)) {
          return new S3ItemBackupService(
            context.container.get(TYPES.S3_BACKUP_BUCKET_NAME),
            context.container.get(TYPES.ItemProjector),
            context.container.get(TYPES.Logger),
            context.container.get(TYPES.S3),
          )
        } else {
          return new FSItemBackupService(
            context.container.get(TYPES.FILE_UPLOAD_PATH),
            context.container.get(TYPES.ItemProjector),
            context.container.get(TYPES.Logger),
          )
        }
      })

    container
      .bind<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler)
      .toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Env)

        const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
          ['DUPLICATE_ITEM_SYNCED', context.container.get(TYPES.DuplicateItemSyncedEventHandler)],
          ['ACCOUNT_DELETION_REQUESTED', context.container.get(TYPES.AccountDeletionRequestedEventHandler)],
          ['EMAIL_BACKUP_REQUESTED', context.container.get(TYPES.EmailBackupRequestedEventHandler)],
          ['ITEM_REVISION_CREATION_REQUESTED', context.container.get(TYPES.ItemRevisionCreationRequestedEventHandler)],
          ['USER_CREDENTIALS_CHANGED', container.get(TYPES.UserCredentialsChangedEventHandler)],
          ['SHARED_VAULT_FILE_REMOVED', container.get(TYPES.SharedVaultFileRemovedEventHandler)],
          ['SHARED_VAULT_FILE_UPLOADED', container.get(TYPES.SharedVaultFileUploadedEventHandler)],
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
