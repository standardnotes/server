import * as winston from 'winston'
import { Container, interfaces } from 'inversify'

import { Env } from './Env'
import TYPES from './Types'
import { AppDataSource } from './DataSource'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { ItemRepositoryInterface } from '../Domain/Item/ItemRepositoryInterface'
import { TypeORMItemRepository } from '../Infra/TypeORM/TypeORMItemRepository'
import { Repository } from 'typeorm'
import { Item } from '../Domain/Item/Item'
import { ItemProjection } from '../Projection/ItemProjection'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { ItemProjector } from '../Projection/ItemProjector'
import {
  DirectCallDomainEventPublisher,
  DirectCallEventMessageHandler,
  SNSDomainEventPublisher,
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { DomainEventFactory } from '../Domain/Event/DomainEventFactory'
import { Timer, TimerInterface } from '@standardnotes/time'
import { ItemTransferCalculatorInterface } from '../Domain/Item/ItemTransferCalculatorInterface'
import { ItemTransferCalculator } from '../Domain/Item/ItemTransferCalculator'
import { ItemConflict } from '../Domain/Item/ItemConflict'
import { ItemFactory } from '../Domain/Item/ItemFactory'
import { ItemFactoryInterface } from '../Domain/Item/ItemFactoryInterface'
import { ItemService } from '../Domain/Item/ItemService'
import { ItemServiceInterface } from '../Domain/Item/ItemServiceInterface'
import { ContentFilter } from '../Domain/Item/SaveRule/ContentFilter'
import { ContentTypeFilter } from '../Domain/Item/SaveRule/ContentTypeFilter'
import { OwnershipFilter } from '../Domain/Item/SaveRule/OwnershipFilter'
import { TimeDifferenceFilter } from '../Domain/Item/SaveRule/TimeDifferenceFilter'
import { UuidFilter } from '../Domain/Item/SaveRule/UuidFilter'
import { ItemSaveValidator } from '../Domain/Item/SaveValidator/ItemSaveValidator'
import { ItemSaveValidatorInterface } from '../Domain/Item/SaveValidator/ItemSaveValidatorInterface'
import { SyncResponseFactory20161215 } from '../Domain/Item/SyncResponse/SyncResponseFactory20161215'
import { SyncResponseFactory20200115 } from '../Domain/Item/SyncResponse/SyncResponseFactory20200115'
import { SyncResponseFactoryResolver } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolver'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { CheckIntegrity } from '../Domain/UseCase/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../Domain/UseCase/GetItem/GetItem'
import { SyncItems } from '../Domain/UseCase/SyncItems'
import { InversifyExpressAuthMiddleware } from '../Infra/InversifyExpressUtils/Middleware/InversifyExpressAuthMiddleware'
import { ItemConflictProjection } from '../Projection/ItemConflictProjection'
import { ItemConflictProjector } from '../Projection/ItemConflictProjector'
import { SavedItemProjection } from '../Projection/SavedItemProjection'
import { SavedItemProjector } from '../Projection/SavedItemProjector'
import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { ContentDecoder } from '@standardnotes/common'
import {
  DomainEventMessageHandlerInterface,
  DomainEventHandlerInterface,
  DomainEventSubscriberFactoryInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'
import axios, { AxiosInstance } from 'axios'
import { AuthHttpServiceInterface } from '../Domain/Auth/AuthHttpServiceInterface'
import { ExtensionsHttpService } from '../Domain/Extension/ExtensionsHttpService'
import { ExtensionsHttpServiceInterface } from '../Domain/Extension/ExtensionsHttpServiceInterface'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { DuplicateItemSyncedEventHandler } from '../Domain/Handler/DuplicateItemSyncedEventHandler'
import { EmailBackupRequestedEventHandler } from '../Domain/Handler/EmailBackupRequestedEventHandler'
import { ItemRevisionCreationRequestedEventHandler } from '../Domain/Handler/ItemRevisionCreationRequestedEventHandler'
import { ItemBackupServiceInterface } from '../Domain/Item/ItemBackupServiceInterface'
import { FSItemBackupService } from '../Infra/FS/FSItemBackupService'
import { AuthHttpService } from '../Infra/HTTP/AuthHttpService'
import { S3ItemBackupService } from '../Infra/S3/S3ItemBackupService'
import { ControllerContainer, ControllerContainerInterface } from '@standardnotes/domain-core'
import { InversifyExpressItemsController } from '../Infra/InversifyExpressUtils/InversifyExpressItemsController'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicFormatter = require('@newrelic/winston-enricher')

export class ContainerConfigLoader {
  private readonly DEFAULT_CONTENT_SIZE_TRANSFER_LIMIT = 10_000_000
  private readonly DEFAULT_MAX_ITEMS_LIMIT = 300
  private readonly DEFAULT_FILE_UPLOAD_PATH = `${__dirname}/../../uploads`

  async load(configuration?: {
    controllerConatiner?: ControllerContainerInterface
    directCallDomainEventPublisher?: DirectCallDomainEventPublisher
  }): Promise<Container> {
    const directCallDomainEventPublisher =
      configuration?.directCallDomainEventPublisher ?? new DirectCallDomainEventPublisher()

    const env: Env = new Env()
    env.load()

    const container = new Container({
      defaultScope: 'Singleton',
    })

    await AppDataSource.initialize()

    const isConfiguredForHomeServer = env.get('DB_TYPE') === 'sqlite'

    container.bind<Env>(TYPES.Sync_Env).toConstantValue(env)

    container.bind<winston.Logger>(TYPES.Sync_Logger).toDynamicValue((context: interfaces.Context) => {
      const env: Env = context.container.get(TYPES.Sync_Env)

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

      return logger
    })

    if (isConfiguredForHomeServer) {
      container
        .bind<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher)
        .toConstantValue(directCallDomainEventPublisher)
    } else {
      container.bind(TYPES.Sync_SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN'))
      container.bind(TYPES.Sync_SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
      container.bind(TYPES.Sync_SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))
      container.bind(TYPES.Sync_S3_AWS_REGION).toConstantValue(env.get('S3_AWS_REGION', true))
      container.bind(TYPES.Sync_S3_BACKUP_BUCKET_NAME).toConstantValue(env.get('S3_BACKUP_BUCKET_NAME', true))
      container.bind(TYPES.Sync_EXTENSIONS_SERVER_URL).toConstantValue(env.get('EXTENSIONS_SERVER_URL', true))
      container.bind(TYPES.Sync_AUTH_SERVER_URL).toConstantValue(env.get('AUTH_SERVER_URL'))

      container.bind<SNSClient>(TYPES.Sync_SNS).toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Sync_Env)

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
        .bind<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher)
        .toDynamicValue((context: interfaces.Context) => {
          return new SNSDomainEventPublisher(
            context.container.get(TYPES.Sync_SNS),
            context.container.get(TYPES.Sync_SNS_TOPIC_ARN),
          )
        })

      container.bind<SQSClient>(TYPES.Sync_SQS).toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Sync_Env)

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

      container.bind<S3Client | undefined>(TYPES.Sync_S3).toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Sync_Env)

        let s3Client = undefined
        if (env.get('S3_AWS_REGION', true)) {
          s3Client = new S3Client({
            apiVersion: 'latest',
            region: env.get('S3_AWS_REGION', true),
          })
        }

        return s3Client
      })
    }

    // Repositories
    container.bind<ItemRepositoryInterface>(TYPES.Sync_ItemRepository).toDynamicValue((context: interfaces.Context) => {
      return new TypeORMItemRepository(context.container.get(TYPES.Sync_ORMItemRepository))
    })

    // ORM
    container
      .bind<Repository<Item>>(TYPES.Sync_ORMItemRepository)
      .toDynamicValue(() => AppDataSource.getRepository(Item))

    // Projectors
    container
      .bind<ProjectorInterface<Item, ItemProjection>>(TYPES.Sync_ItemProjector)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemProjector(context.container.get(TYPES.Sync_Timer))
      })

    container.bind<TimerInterface>(TYPES.Sync_Timer).toDynamicValue(() => new Timer())

    container
      .bind<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory)
      .toDynamicValue((context: interfaces.Context) => {
        return new DomainEventFactory(context.container.get(TYPES.Sync_Timer))
      })

    container
      .bind<ItemTransferCalculatorInterface>(TYPES.Sync_ItemTransferCalculator)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemTransferCalculator(
          context.container.get(TYPES.Sync_ItemRepository),
          context.container.get(TYPES.Sync_Logger),
        )
      })

    // Middleware
    container
      .bind<InversifyExpressAuthMiddleware>(TYPES.Sync_AuthMiddleware)
      .toDynamicValue((context: interfaces.Context) => {
        return new InversifyExpressAuthMiddleware(
          context.container.get(TYPES.Sync_AUTH_JWT_SECRET),
          context.container.get(TYPES.Sync_Logger),
        )
      })

    // Projectors
    container
      .bind<ProjectorInterface<Item, SavedItemProjection>>(TYPES.Sync_SavedItemProjector)
      .toDynamicValue((context: interfaces.Context) => {
        return new SavedItemProjector(context.container.get(TYPES.Sync_Timer))
      })
    container
      .bind<ProjectorInterface<ItemConflict, ItemConflictProjection>>(TYPES.Sync_ItemConflictProjector)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemConflictProjector(context.container.get(TYPES.Sync_ItemProjector))
      })

    // env vars
    container.bind(TYPES.Sync_AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container
      .bind(TYPES.Sync_REVISIONS_FREQUENCY)
      .toConstantValue(env.get('REVISIONS_FREQUENCY', true) ? +env.get('REVISIONS_FREQUENCY', true) : 300)
    container.bind(TYPES.Sync_NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.Sync_VERSION).toConstantValue(env.get('VERSION'))
    container
      .bind(TYPES.Sync_CONTENT_SIZE_TRANSFER_LIMIT)
      .toConstantValue(
        env.get('CONTENT_SIZE_TRANSFER_LIMIT', true)
          ? +env.get('CONTENT_SIZE_TRANSFER_LIMIT', true)
          : this.DEFAULT_CONTENT_SIZE_TRANSFER_LIMIT,
      )
    container
      .bind(TYPES.Sync_MAX_ITEMS_LIMIT)
      .toConstantValue(
        env.get('MAX_ITEMS_LIMIT', true) ? +env.get('MAX_ITEMS_LIMIT', true) : this.DEFAULT_MAX_ITEMS_LIMIT,
      )

    // use cases
    container.bind<SyncItems>(TYPES.Sync_SyncItems).toDynamicValue((context: interfaces.Context) => {
      return new SyncItems(context.container.get(TYPES.Sync_ItemService))
    })
    container.bind<CheckIntegrity>(TYPES.Sync_CheckIntegrity).toDynamicValue((context: interfaces.Context) => {
      return new CheckIntegrity(context.container.get(TYPES.Sync_ItemRepository))
    })
    container.bind<GetItem>(TYPES.Sync_GetItem).toDynamicValue((context: interfaces.Context) => {
      return new GetItem(context.container.get(TYPES.Sync_ItemRepository))
    })

    // Services
    container.bind<ItemServiceInterface>(TYPES.Sync_ItemService).toDynamicValue((context: interfaces.Context) => {
      return new ItemService(
        context.container.get(TYPES.Sync_ItemSaveValidator),
        context.container.get(TYPES.Sync_ItemFactory),
        context.container.get(TYPES.Sync_ItemRepository),
        context.container.get(TYPES.Sync_DomainEventPublisher),
        context.container.get(TYPES.Sync_DomainEventFactory),
        context.container.get(TYPES.Sync_REVISIONS_FREQUENCY),
        context.container.get(TYPES.Sync_CONTENT_SIZE_TRANSFER_LIMIT),
        context.container.get(TYPES.Sync_ItemTransferCalculator),
        context.container.get(TYPES.Sync_Timer),
        context.container.get(TYPES.Sync_ItemProjector),
        context.container.get(TYPES.Sync_MAX_ITEMS_LIMIT),
        context.container.get(TYPES.Sync_Logger),
      )
    })
    container
      .bind<SyncResponseFactory20161215>(TYPES.Sync_SyncResponseFactory20161215)
      .toDynamicValue((context: interfaces.Context) => {
        return new SyncResponseFactory20161215(context.container.get(TYPES.Sync_ItemProjector))
      })
    container
      .bind<SyncResponseFactory20200115>(TYPES.Sync_SyncResponseFactory20200115)
      .toDynamicValue((context: interfaces.Context) => {
        return new SyncResponseFactory20200115(
          context.container.get(TYPES.Sync_ItemProjector),
          context.container.get(TYPES.Sync_ItemConflictProjector),
          context.container.get(TYPES.Sync_SavedItemProjector),
        )
      })
    container
      .bind<SyncResponseFactoryResolverInterface>(TYPES.Sync_SyncResponseFactoryResolver)
      .toDynamicValue((context: interfaces.Context) => {
        return new SyncResponseFactoryResolver(
          context.container.get(TYPES.Sync_SyncResponseFactory20161215),
          context.container.get(TYPES.Sync_SyncResponseFactory20200115),
        )
      })

    container.bind<ItemFactoryInterface>(TYPES.Sync_ItemFactory).toDynamicValue((context: interfaces.Context) => {
      return new ItemFactory(context.container.get(TYPES.Sync_Timer), context.container.get(TYPES.Sync_ItemProjector))
    })

    container.bind<OwnershipFilter>(TYPES.Sync_OwnershipFilter).toDynamicValue(() => new OwnershipFilter())
    container
      .bind<TimeDifferenceFilter>(TYPES.Sync_TimeDifferenceFilter)
      .toDynamicValue(
        (context: interfaces.Context) => new TimeDifferenceFilter(context.container.get(TYPES.Sync_Timer)),
      )
    container.bind<UuidFilter>(TYPES.Sync_UuidFilter).toDynamicValue(() => new UuidFilter())
    container.bind<ContentTypeFilter>(TYPES.Sync_ContentTypeFilter).toDynamicValue(() => new ContentTypeFilter())
    container.bind<ContentFilter>(TYPES.Sync_ContentFilter).toDynamicValue(() => new ContentFilter())

    container
      .bind<ItemSaveValidatorInterface>(TYPES.Sync_ItemSaveValidator)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemSaveValidator([
          context.container.get(TYPES.Sync_OwnershipFilter),
          context.container.get(TYPES.Sync_TimeDifferenceFilter),
          context.container.get(TYPES.Sync_UuidFilter),
          context.container.get(TYPES.Sync_ContentTypeFilter),
          context.container.get(TYPES.Sync_ContentFilter),
        ])
      })

    // env vars
    container
      .bind(TYPES.Sync_EMAIL_ATTACHMENT_MAX_BYTE_SIZE)
      .toConstantValue(
        env.get('EMAIL_ATTACHMENT_MAX_BYTE_SIZE', true) ? +env.get('EMAIL_ATTACHMENT_MAX_BYTE_SIZE', true) : 10485760,
      )
    container.bind(TYPES.Sync_NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.Sync_VERSION).toConstantValue(env.get('VERSION'))
    container
      .bind(TYPES.Sync_FILE_UPLOAD_PATH)
      .toConstantValue(
        env.get('FILE_UPLOAD_PATH', true) ? env.get('FILE_UPLOAD_PATH', true) : this.DEFAULT_FILE_UPLOAD_PATH,
      )

    // Handlers
    container
      .bind<DuplicateItemSyncedEventHandler>(TYPES.Sync_DuplicateItemSyncedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new DuplicateItemSyncedEventHandler(
          context.container.get(TYPES.Sync_ItemRepository),
          context.container.get(TYPES.Sync_DomainEventFactory),
          context.container.get(TYPES.Sync_DomainEventPublisher),
          context.container.get(TYPES.Sync_Logger),
        )
      })
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.Sync_AccountDeletionRequestedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new AccountDeletionRequestedEventHandler(
          context.container.get(TYPES.Sync_ItemRepository),
          context.container.get(TYPES.Sync_Logger),
        )
      })
    container
      .bind<EmailBackupRequestedEventHandler>(TYPES.Sync_EmailBackupRequestedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new EmailBackupRequestedEventHandler(
          context.container.get(TYPES.Sync_ItemRepository),
          context.container.get(TYPES.Sync_AuthHttpService),
          context.container.get(TYPES.Sync_ItemBackupService),
          context.container.get(TYPES.Sync_DomainEventPublisher),
          context.container.get(TYPES.Sync_DomainEventFactory),
          context.container.get(TYPES.Sync_EMAIL_ATTACHMENT_MAX_BYTE_SIZE),
          context.container.get(TYPES.Sync_ItemTransferCalculator),
          context.container.get(TYPES.Sync_S3_BACKUP_BUCKET_NAME),
          context.container.get(TYPES.Sync_Logger),
        )
      })
    container
      .bind<ItemRevisionCreationRequestedEventHandler>(TYPES.Sync_ItemRevisionCreationRequestedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemRevisionCreationRequestedEventHandler(
          context.container.get(TYPES.Sync_ItemRepository),
          context.container.get(TYPES.Sync_ItemBackupService),
          context.container.get(TYPES.Sync_DomainEventFactory),
          context.container.get(TYPES.Sync_DomainEventPublisher),
        )
      })

    // Services
    container.bind<ContentDecoder>(TYPES.Sync_ContentDecoder).toDynamicValue(() => new ContentDecoder())
    container.bind<AxiosInstance>(TYPES.Sync_HTTPClient).toDynamicValue(() => axios.create())
    container
      .bind<AuthHttpServiceInterface>(TYPES.Sync_AuthHttpService)
      .toDynamicValue((context: interfaces.Context) => {
        return new AuthHttpService(
          context.container.get(TYPES.Sync_HTTPClient),
          context.container.get(TYPES.Sync_AUTH_SERVER_URL),
        )
      })
    container
      .bind<ExtensionsHttpServiceInterface>(TYPES.Sync_ExtensionsHttpService)
      .toDynamicValue((context: interfaces.Context) => {
        return new ExtensionsHttpService(
          context.container.get(TYPES.Sync_HTTPClient),
          context.container.get(TYPES.Sync_ItemRepository),
          context.container.get(TYPES.Sync_ContentDecoder),
          context.container.get(TYPES.Sync_DomainEventPublisher),
          context.container.get(TYPES.Sync_DomainEventFactory),
          context.container.get(TYPES.Sync_Logger),
        )
      })

    container
      .bind<ItemBackupServiceInterface>(TYPES.Sync_ItemBackupService)
      .toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Sync_Env)

        if (env.get('S3_AWS_REGION', true)) {
          return new S3ItemBackupService(
            context.container.get(TYPES.Sync_S3_BACKUP_BUCKET_NAME),
            context.container.get(TYPES.Sync_ItemProjector),
            context.container.get(TYPES.Sync_Logger),
            context.container.get(TYPES.Sync_S3),
          )
        } else {
          return new FSItemBackupService(
            context.container.get(TYPES.Sync_FILE_UPLOAD_PATH),
            context.container.get(TYPES.Sync_ItemProjector),
            context.container.get(TYPES.Sync_Logger),
          )
        }
      })

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['DUPLICATE_ITEM_SYNCED', container.get(TYPES.Sync_DuplicateItemSyncedEventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.Sync_AccountDeletionRequestedEventHandler)],
      ['EMAIL_BACKUP_REQUESTED', container.get(TYPES.Sync_EmailBackupRequestedEventHandler)],
      ['ITEM_REVISION_CREATION_REQUESTED', container.get(TYPES.Sync_ItemRevisionCreationRequestedEventHandler)],
    ])

    if (isConfiguredForHomeServer) {
      const directCallEventMessageHandler = new DirectCallEventMessageHandler(
        eventHandlers,
        container.get(TYPES.Sync_Logger),
      )
      directCallDomainEventPublisher.register(directCallEventMessageHandler)

      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.Sync_DomainEventMessageHandler)
        .toConstantValue(directCallEventMessageHandler)
    } else {
      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.Sync_DomainEventMessageHandler)
        .toConstantValue(
          env.get('NEW_RELIC_ENABLED', true) === 'true'
            ? new SQSNewRelicEventMessageHandler(eventHandlers, container.get(TYPES.Sync_Logger))
            : new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Sync_Logger)),
        )
    }

    container
      .bind<DomainEventSubscriberFactoryInterface>(TYPES.Sync_DomainEventSubscriberFactory)
      .toDynamicValue((context: interfaces.Context) => {
        return new SQSDomainEventSubscriberFactory(
          context.container.get(TYPES.Sync_SQS),
          context.container.get(TYPES.Sync_SQS_QUEUE_URL),
          context.container.get(TYPES.Sync_DomainEventMessageHandler),
        )
      })

    container
      .bind<ControllerContainerInterface>(TYPES.Sync_ControllerContainer)
      .toConstantValue(configuration?.controllerConatiner ?? new ControllerContainer())

    if (isConfiguredForHomeServer) {
      container
        .bind<InversifyExpressItemsController>(TYPES.Sync_InversifyExpressItemsController)
        .toConstantValue(
          new InversifyExpressItemsController(
            container.get(TYPES.Sync_SyncItems),
            container.get(TYPES.Sync_CheckIntegrity),
            container.get(TYPES.Sync_GetItem),
            container.get(TYPES.Sync_ItemProjector),
            container.get(TYPES.Sync_SyncResponseFactoryResolver),
            container.get(TYPES.Sync_ControllerContainer),
          ),
        )
    }

    return container
  }
}
