import * as winston from 'winston'
import { Container, interfaces } from 'inversify'

import { Env } from './Env'
import TYPES from './Types'
import { AppDataSource } from './DataSource'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { ItemRepositoryInterface } from '../Domain/Item/ItemRepositoryInterface'
import { SQLLegacyItemRepository } from '../Infra/TypeORM/SQLLegacyItemRepository'
import { MongoRepository, Repository } from 'typeorm'
import { Item } from '../Domain/Item/Item'
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
import { ContentFilter } from '../Domain/Item/SaveRule/ContentFilter'
import { ContentTypeFilter } from '../Domain/Item/SaveRule/ContentTypeFilter'
import { OwnershipFilter } from '../Domain/Item/SaveRule/OwnershipFilter'
import { TimeDifferenceFilter } from '../Domain/Item/SaveRule/TimeDifferenceFilter'
import { ItemSaveValidator } from '../Domain/Item/SaveValidator/ItemSaveValidator'
import { ItemSaveValidatorInterface } from '../Domain/Item/SaveValidator/ItemSaveValidatorInterface'
import { SyncResponseFactory20161215 } from '../Domain/Item/SyncResponse/SyncResponseFactory20161215'
import { SyncResponseFactory20200115 } from '../Domain/Item/SyncResponse/SyncResponseFactory20200115'
import { SyncResponseFactoryResolver } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolver'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { CheckIntegrity } from '../Domain/UseCase/Syncing/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../Domain/UseCase/Syncing/GetItem/GetItem'
import { SyncItems } from '../Domain/UseCase/Syncing/SyncItems/SyncItems'
import { InversifyExpressAuthMiddleware } from '../Infra/InversifyExpressUtils/Middleware/InversifyExpressAuthMiddleware'
import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { ContentDecoder, ContentDecoderInterface } from '@standardnotes/common'
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
import { ControllerContainer, ControllerContainerInterface, MapperInterface } from '@standardnotes/domain-core'
import { BaseItemsController } from '../Infra/InversifyExpressUtils/Base/BaseItemsController'
import { Transform } from 'stream'
import { SQLLegacyItem } from '../Infra/TypeORM/SQLLegacyItem'
import { SQLLegacyItemPersistenceMapper } from '../Mapping/Persistence/SQLLegacyItemPersistenceMapper'
import { ItemHttpRepresentation } from '../Mapping/Http/ItemHttpRepresentation'
import { ItemHttpMapper } from '../Mapping/Http/ItemHttpMapper'
import { SavedItemHttpRepresentation } from '../Mapping/Http/SavedItemHttpRepresentation'
import { SavedItemHttpMapper } from '../Mapping/Http/SavedItemHttpMapper'
import { ItemConflictHttpRepresentation } from '../Mapping/Http/ItemConflictHttpRepresentation'
import { ItemConflictHttpMapper } from '../Mapping/Http/ItemConflictHttpMapper'
import { ItemBackupRepresentation } from '../Mapping/Backup/ItemBackupRepresentation'
import { ItemBackupMapper } from '../Mapping/Backup/ItemBackupMapper'
import { SaveNewItem } from '../Domain/UseCase/Syncing/SaveNewItem/SaveNewItem'
import { UpdateExistingItem } from '../Domain/UseCase/Syncing/UpdateExistingItem/UpdateExistingItem'
import { GetItems } from '../Domain/UseCase/Syncing/GetItems/GetItems'
import { SaveItems } from '../Domain/UseCase/Syncing/SaveItems/SaveItems'
import { ItemHashHttpMapper } from '../Mapping/Http/ItemHashHttpMapper'
import { ItemHash } from '../Domain/Item/ItemHash'
import { ItemHashHttpRepresentation } from '../Mapping/Http/ItemHashHttpRepresentation'
import { BaseSharedVaultInvitesController } from '../Infra/InversifyExpressUtils/Base/BaseSharedVaultInvitesController'
import { InviteUserToSharedVault } from '../Domain/UseCase/SharedVaults/InviteUserToSharedVault/InviteUserToSharedVault'
import { TypeORMSharedVaultRepository } from '../Infra/TypeORM/TypeORMSharedVaultRepository'
import { TypeORMSharedVault } from '../Infra/TypeORM/TypeORMSharedVault'
import { TypeORMSharedVaultInvite } from '../Infra/TypeORM/TypeORMSharedVaultInvite'
import { TypeORMSharedVaultUser } from '../Infra/TypeORM/TypeORMSharedVaultUser'
import { SharedVaultRepositoryInterface } from '../Domain/SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultPersistenceMapper } from '../Mapping/Persistence/SharedVaultPersistenceMapper'
import { SharedVault } from '../Domain/SharedVault/SharedVault'
import { SharedVaultUser } from '../Domain/SharedVault/User/SharedVaultUser'
import { SharedVaultUserPersistenceMapper } from '../Mapping/Persistence/SharedVaultUserPersistenceMapper'
import { SharedVaultInvite } from '../Domain/SharedVault/User/Invite/SharedVaultInvite'
import { SharedVaultInvitePersistenceMapper } from '../Mapping/Persistence/SharedVaultInvitePersistenceMapper'
import { SharedVaultUserRepositoryInterface } from '../Domain/SharedVault/User/SharedVaultUserRepositoryInterface'
import { TypeORMSharedVaultUserRepository } from '../Infra/TypeORM/TypeORMSharedVaultUserRepository'
import { SharedVaultInviteRepositoryInterface } from '../Domain/SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { TypeORMSharedVaultInviteRepository } from '../Infra/TypeORM/TypeORMSharedVaultInviteRepository'
import { UpdateSharedVaultInvite } from '../Domain/UseCase/SharedVaults/UpdateSharedVaultInvite/UpdateSharedVaultInvite'
import { AcceptInviteToSharedVault } from '../Domain/UseCase/SharedVaults/AcceptInviteToSharedVault/AcceptInviteToSharedVault'
import { AddUserToSharedVault } from '../Domain/UseCase/SharedVaults/AddUserToSharedVault/AddUserToSharedVault'
import { DeclineInviteToSharedVault } from '../Domain/UseCase/SharedVaults/DeclineInviteToSharedVault/DeclineInviteToSharedVault'
import { DeleteSharedVaultInvitesToUser } from '../Domain/UseCase/SharedVaults/DeleteSharedVaultInvitesToUser/DeleteSharedVaultInvitesToUser'
import { DeleteSharedVaultInvitesSentByUser } from '../Domain/UseCase/SharedVaults/DeleteSharedVaultInvitesSentByUser/DeleteSharedVaultInvitesSentByUser'
import { GetSharedVaultInvitesSentByUser } from '../Domain/UseCase/SharedVaults/GetSharedVaultInvitesSentByUser/GetSharedVaultInvitesSentByUser'
import { GetSharedVaultInvitesSentToUser } from '../Domain/UseCase/SharedVaults/GetSharedVaultInvitesSentToUser/GetSharedVaultInvitesSentToUser'
import { BaseSharedVaultUsersController } from '../Infra/InversifyExpressUtils/Base/BaseSharedVaultUsersController'
import { GetSharedVaultUsers } from '../Domain/UseCase/SharedVaults/GetSharedVaultUsers/GetSharedVaultUsers'
import { RemoveUserFromSharedVault } from '../Domain/UseCase/SharedVaults/RemoveUserFromSharedVault/RemoveUserFromSharedVault'
import { AddNotificationForUser } from '../Domain/UseCase/Messaging/AddNotificationForUser/AddNotificationForUser'
import { TypeORMNotification } from '../Infra/TypeORM/TypeORMNotification'
import { NotificationRepositoryInterface } from '../Domain/Notifications/NotificationRepositoryInterface'
import { TypeORMNotificationRepository } from '../Infra/TypeORM/TypeORMNotificationRepository'
import { NotificationPersistenceMapper } from '../Mapping/Persistence/NotificationPersistenceMapper'
import { Notification } from '../Domain/Notifications/Notification'
import { SharedVaultUserHttpRepresentation } from '../Mapping/Http/SharedVaultUserHttpRepresentation'
import { SharedVaultUserHttpMapper } from '../Mapping/Http/SharedVaultUserHttpMapper'
import { BaseSharedVaultsController } from '../Infra/InversifyExpressUtils/Base/BaseSharedVaultsController'
import { GetSharedVaults } from '../Domain/UseCase/SharedVaults/GetSharedVaults/GetSharedVaults'
import { CreateSharedVault } from '../Domain/UseCase/SharedVaults/CreateSharedVault/CreateSharedVault'
import { DeleteSharedVault } from '../Domain/UseCase/SharedVaults/DeleteSharedVault/DeleteSharedVault'
import { CreateSharedVaultFileValetToken } from '../Domain/UseCase/SharedVaults/CreateSharedVaultFileValetToken/CreateSharedVaultFileValetToken'
import { SharedVaultValetTokenData, TokenEncoder, TokenEncoderInterface } from '@standardnotes/security'
import { SharedVaultHttpRepresentation } from '../Mapping/Http/SharedVaultHttpRepresentation'
import { SharedVaultHttpMapper } from '../Mapping/Http/SharedVaultHttpMapper'
import { SharedVaultInviteHttpRepresentation } from '../Mapping/Http/SharedVaultInviteHttpRepresentation'
import { SharedVaultInviteHttpMapper } from '../Mapping/Http/SharedVaultInviteHttpMapper'
import { BaseMessagesController } from '../Infra/InversifyExpressUtils/Base/BaseMessagesController'
import { GetMessagesSentToUser } from '../Domain/UseCase/Messaging/GetMessagesSentToUser/GetMessagesSentToUser'
import { TypeORMMessage } from '../Infra/TypeORM/TypeORMMessage'
import { MessageRepositoryInterface } from '../Domain/Message/MessageRepositoryInterface'
import { TypeORMMessageRepository } from '../Infra/TypeORM/TypeORMMessageRepository'
import { Message } from '../Domain/Message/Message'
import { MessagePersistenceMapper } from '../Mapping/Persistence/MessagePersistenceMapper'
import { GetMessagesSentByUser } from '../Domain/UseCase/Messaging/GetMessagesSentByUser/GetMessagesSentByUser'
import { SendMessageToUser } from '../Domain/UseCase/Messaging/SendMessageToUser/SendMessageToUser'
import { DeleteAllMessagesSentToUser } from '../Domain/UseCase/Messaging/DeleteAllMessagesSentToUser/DeleteAllMessagesSentToUser'
import { DeleteMessage } from '../Domain/UseCase/Messaging/DeleteMessage/DeleteMessage'
import { MessageHttpRepresentation } from '../Mapping/Http/MessageHttpRepresentation'
import { MessageHttpMapper } from '../Mapping/Http/MessageHttpMapper'
import { GetUserNotifications } from '../Domain/UseCase/Messaging/GetUserNotifications/GetUserNotifications'
import { NotificationHttpMapper } from '../Mapping/Http/NotificationHttpMapper'
import { NotificationHttpRepresentation } from '../Mapping/Http/NotificationHttpRepresentation'
import { DetermineSharedVaultOperationOnItem } from '../Domain/UseCase/SharedVaults/DetermineSharedVaultOperationOnItem/DetermineSharedVaultOperationOnItem'
import { SharedVaultFilter } from '../Domain/Item/SaveRule/SharedVaultFilter'
import { RemoveNotificationsForUser } from '../Domain/UseCase/Messaging/RemoveNotificationsForUser/RemoveNotificationsForUser'
import { SharedVaultSnjsFilter } from '../Domain/Item/SaveRule/SharedVaultSnjsFilter'
import { UpdateStorageQuotaUsedInSharedVault } from '../Domain/UseCase/SharedVaults/UpdateStorageQuotaUsedInSharedVault/UpdateStorageQuotaUsedInSharedVault'
import { SharedVaultFileUploadedEventHandler } from '../Domain/Handler/SharedVaultFileUploadedEventHandler'
import { SharedVaultFileRemovedEventHandler } from '../Domain/Handler/SharedVaultFileRemovedEventHandler'
import { AddNotificationsForUsers } from '../Domain/UseCase/Messaging/AddNotificationsForUsers/AddNotificationsForUsers'
import { MongoDBItem } from '../Infra/TypeORM/MongoDBItem'
import { MongoDBItemRepository } from '../Infra/TypeORM/MongoDBItemRepository'
import { MongoDBItemPersistenceMapper } from '../Mapping/Persistence/MongoDB/MongoDBItemPersistenceMapper'
import { Logger } from 'winston'
import { ItemRepositoryResolverInterface } from '../Domain/Item/ItemRepositoryResolverInterface'
import { TypeORMItemRepositoryResolver } from '../Infra/TypeORM/TypeORMItemRepositoryResolver'
import { TransitionItemsFromPrimaryToSecondaryDatabaseForUser } from '../Domain/UseCase/Transition/TransitionItemsFromPrimaryToSecondaryDatabaseForUser/TransitionItemsFromPrimaryToSecondaryDatabaseForUser'
import { SharedVaultFileMovedEventHandler } from '../Domain/Handler/SharedVaultFileMovedEventHandler'
import { TransitionStatusUpdatedEventHandler } from '../Domain/Handler/TransitionStatusUpdatedEventHandler'
import { TriggerTransitionFromPrimaryToSecondaryDatabaseForUser } from '../Domain/UseCase/Transition/TriggerTransitionFromPrimaryToSecondaryDatabaseForUser/TriggerTransitionFromPrimaryToSecondaryDatabaseForUser'

export class ContainerConfigLoader {
  private readonly DEFAULT_CONTENT_SIZE_TRANSFER_LIMIT = 10_000_000
  private readonly DEFAULT_MAX_ITEMS_LIMIT = 300
  private readonly DEFAULT_FILE_UPLOAD_PATH = `${__dirname}/../../uploads`

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

    const container = new Container({
      defaultScope: 'Singleton',
    })

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
        defaultMeta: { service: 'syncing-server' },
      })
    }
    container.bind<winston.Logger>(TYPES.Sync_Logger).toConstantValue(logger)

    const appDataSource = new AppDataSource(env)
    await appDataSource.initialize()

    logger.debug('Database initialized')

    container.bind<TimerInterface>(TYPES.Sync_Timer).toConstantValue(new Timer())

    const isConfiguredForHomeServer = env.get('MODE', true) === 'home-server'
    const isSecondaryDatabaseEnabled = env.get('SECONDARY_DB_ENABLED', true) === 'true'

    container.bind<Env>(TYPES.Sync_Env).toConstantValue(env)

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

    container
      .bind(TYPES.Sync_EMAIL_ATTACHMENT_MAX_BYTE_SIZE)
      .toConstantValue(
        env.get('EMAIL_ATTACHMENT_MAX_BYTE_SIZE', true) ? +env.get('EMAIL_ATTACHMENT_MAX_BYTE_SIZE', true) : 10485760,
      )
    container.bind(TYPES.Sync_NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container
      .bind(TYPES.Sync_FILE_UPLOAD_PATH)
      .toConstantValue(
        env.get('FILE_UPLOAD_PATH', true) ? env.get('FILE_UPLOAD_PATH', true) : this.DEFAULT_FILE_UPLOAD_PATH,
      )

    // Mapping
    container
      .bind<MapperInterface<Item, SQLLegacyItem>>(TYPES.Sync_SQLLegacyItemPersistenceMapper)
      .toConstantValue(new SQLLegacyItemPersistenceMapper())
    container
      .bind<MapperInterface<ItemHash, ItemHashHttpRepresentation>>(TYPES.Sync_ItemHashHttpMapper)
      .toConstantValue(new ItemHashHttpMapper())
    container
      .bind<MapperInterface<Item, ItemHttpRepresentation>>(TYPES.Sync_ItemHttpMapper)
      .toConstantValue(new ItemHttpMapper(container.get(TYPES.Sync_Timer)))
    container
      .bind<MapperInterface<Item, SavedItemHttpRepresentation>>(TYPES.Sync_SavedItemHttpMapper)
      .toConstantValue(new SavedItemHttpMapper(container.get(TYPES.Sync_Timer)))
    container
      .bind<MapperInterface<ItemConflict, ItemConflictHttpRepresentation>>(TYPES.Sync_ItemConflictHttpMapper)
      .toConstantValue(
        new ItemConflictHttpMapper(
          container.get(TYPES.Sync_ItemHttpMapper),
          container.get(TYPES.Sync_ItemHashHttpMapper),
        ),
      )
    container
      .bind<MapperInterface<Item, ItemBackupRepresentation>>(TYPES.Sync_ItemBackupMapper)
      .toConstantValue(new ItemBackupMapper(container.get(TYPES.Sync_Timer)))
    container
      .bind<MapperInterface<SharedVault, TypeORMSharedVault>>(TYPES.Sync_SharedVaultPersistenceMapper)
      .toConstantValue(new SharedVaultPersistenceMapper())
    container
      .bind<MapperInterface<SharedVaultUser, TypeORMSharedVaultUser>>(TYPES.Sync_SharedVaultUserPersistenceMapper)
      .toConstantValue(new SharedVaultUserPersistenceMapper())
    container
      .bind<MapperInterface<SharedVaultInvite, TypeORMSharedVaultInvite>>(TYPES.Sync_SharedVaultInvitePersistenceMapper)
      .toConstantValue(new SharedVaultInvitePersistenceMapper())
    container
      .bind<MapperInterface<Notification, TypeORMNotification>>(TYPES.Sync_NotificationPersistenceMapper)
      .toConstantValue(new NotificationPersistenceMapper())
    container
      .bind<MapperInterface<SharedVaultUser, SharedVaultUserHttpRepresentation>>(TYPES.Sync_SharedVaultUserHttpMapper)
      .toConstantValue(new SharedVaultUserHttpMapper())
    container
      .bind<MapperInterface<SharedVault, SharedVaultHttpRepresentation>>(TYPES.Sync_SharedVaultHttpMapper)
      .toConstantValue(new SharedVaultHttpMapper())
    container
      .bind<MapperInterface<SharedVaultInvite, SharedVaultInviteHttpRepresentation>>(
        TYPES.Sync_SharedVaultInviteHttpMapper,
      )
      .toConstantValue(new SharedVaultInviteHttpMapper())
    container
      .bind<MapperInterface<Message, TypeORMMessage>>(TYPES.Sync_MessagePersistenceMapper)
      .toConstantValue(new MessagePersistenceMapper())
    container
      .bind<MapperInterface<Message, MessageHttpRepresentation>>(TYPES.Sync_MessageHttpMapper)
      .toConstantValue(new MessageHttpMapper())
    container
      .bind<MapperInterface<Notification, NotificationHttpRepresentation>>(TYPES.Sync_NotificationHttpMapper)
      .toConstantValue(new NotificationHttpMapper())

    // ORM
    container
      .bind<Repository<SQLLegacyItem>>(TYPES.Sync_ORMLegacyItemRepository)
      .toDynamicValue(() => appDataSource.getRepository(SQLLegacyItem))
    container
      .bind<Repository<TypeORMSharedVault>>(TYPES.Sync_ORMSharedVaultRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMSharedVault))
    container
      .bind<Repository<TypeORMSharedVaultInvite>>(TYPES.Sync_ORMSharedVaultInviteRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMSharedVaultInvite))
    container
      .bind<Repository<TypeORMSharedVaultUser>>(TYPES.Sync_ORMSharedVaultUserRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMSharedVaultUser))
    container
      .bind<Repository<TypeORMNotification>>(TYPES.Sync_ORMNotificationRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMNotification))
    container
      .bind<Repository<TypeORMMessage>>(TYPES.Sync_ORMMessageRepository)
      .toConstantValue(appDataSource.getRepository(TypeORMMessage))

    // Mongo
    if (isSecondaryDatabaseEnabled) {
      container
        .bind<MapperInterface<Item, MongoDBItem>>(TYPES.Sync_MongoDBItemPersistenceMapper)
        .toConstantValue(new MongoDBItemPersistenceMapper())

      container
        .bind<MongoRepository<MongoDBItem>>(TYPES.Sync_ORMMongoItemRepository)
        .toConstantValue(appDataSource.getMongoRepository(MongoDBItem))

      container
        .bind<ItemRepositoryInterface>(TYPES.Sync_MongoDBItemRepository)
        .toConstantValue(
          new MongoDBItemRepository(
            container.get<MongoRepository<MongoDBItem>>(TYPES.Sync_ORMMongoItemRepository),
            container.get<MapperInterface<Item, MongoDBItem>>(TYPES.Sync_MongoDBItemPersistenceMapper),
            container.get<Logger>(TYPES.Sync_Logger),
          ),
        )
    }

    // Repositories
    container
      .bind<ItemRepositoryInterface>(TYPES.Sync_SQLLegacyItemRepository)
      .toConstantValue(
        new SQLLegacyItemRepository(
          container.get<Repository<SQLLegacyItem>>(TYPES.Sync_ORMLegacyItemRepository),
          container.get<MapperInterface<Item, SQLLegacyItem>>(TYPES.Sync_SQLLegacyItemPersistenceMapper),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<ItemRepositoryResolverInterface>(TYPES.Sync_ItemRepositoryResolver)
      .toConstantValue(
        new TypeORMItemRepositoryResolver(
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLLegacyItemRepository),
          isSecondaryDatabaseEnabled ? container.get<ItemRepositoryInterface>(TYPES.Sync_MongoDBItemRepository) : null,
        ),
      )
    container
      .bind<SharedVaultRepositoryInterface>(TYPES.Sync_SharedVaultRepository)
      .toConstantValue(
        new TypeORMSharedVaultRepository(
          container.get(TYPES.Sync_ORMSharedVaultRepository),
          container.get(TYPES.Sync_SharedVaultPersistenceMapper),
        ),
      )
    container
      .bind<SharedVaultUserRepositoryInterface>(TYPES.Sync_SharedVaultUserRepository)
      .toConstantValue(
        new TypeORMSharedVaultUserRepository(
          container.get(TYPES.Sync_ORMSharedVaultUserRepository),
          container.get(TYPES.Sync_SharedVaultUserPersistenceMapper),
        ),
      )
    container
      .bind<SharedVaultInviteRepositoryInterface>(TYPES.Sync_SharedVaultInviteRepository)
      .toConstantValue(
        new TypeORMSharedVaultInviteRepository(
          container.get(TYPES.Sync_ORMSharedVaultInviteRepository),
          container.get(TYPES.Sync_SharedVaultInvitePersistenceMapper),
        ),
      )
    container
      .bind<NotificationRepositoryInterface>(TYPES.Sync_NotificationRepository)
      .toConstantValue(
        new TypeORMNotificationRepository(
          container.get(TYPES.Sync_ORMNotificationRepository),
          container.get(TYPES.Sync_NotificationPersistenceMapper),
        ),
      )
    container
      .bind<MessageRepositoryInterface>(TYPES.Sync_MessageRepository)
      .toConstantValue(
        new TypeORMMessageRepository(
          container.get(TYPES.Sync_ORMMessageRepository),
          container.get(TYPES.Sync_MessagePersistenceMapper),
        ),
      )

    container
      .bind<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory)
      .toDynamicValue((context: interfaces.Context) => {
        return new DomainEventFactory(context.container.get(TYPES.Sync_Timer))
      })

    container
      .bind<ItemTransferCalculatorInterface>(TYPES.Sync_ItemTransferCalculator)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemTransferCalculator(context.container.get<Logger>(TYPES.Sync_Logger))
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

    // env vars
    container.bind(TYPES.Sync_AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container
      .bind(TYPES.Sync_REVISIONS_FREQUENCY)
      .toConstantValue(env.get('REVISIONS_FREQUENCY', true) ? +env.get('REVISIONS_FREQUENCY', true) : 300)
    container.bind(TYPES.Sync_NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.Sync_VERSION).toConstantValue(env.get('VERSION', true) ?? 'development')
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
    container.bind(TYPES.Sync_VALET_TOKEN_SECRET).toConstantValue(env.get('VALET_TOKEN_SECRET', true))
    container
      .bind(TYPES.Sync_VALET_TOKEN_TTL)
      .toConstantValue(env.get('VALET_TOKEN_TTL', true) ? +env.get('VALET_TOKEN_TTL', true) : 7200)

    container
      .bind<TokenEncoderInterface<SharedVaultValetTokenData>>(TYPES.Sync_SharedVaultValetTokenEncoder)
      .toConstantValue(new TokenEncoder<SharedVaultValetTokenData>(container.get(TYPES.Sync_VALET_TOKEN_SECRET)))

    container
      .bind<DetermineSharedVaultOperationOnItem>(TYPES.Sync_DetermineSharedVaultOperationOnItem)
      .toConstantValue(new DetermineSharedVaultOperationOnItem())

    container.bind<OwnershipFilter>(TYPES.Sync_OwnershipFilter).toConstantValue(new OwnershipFilter())
    container
      .bind<TimeDifferenceFilter>(TYPES.Sync_TimeDifferenceFilter)
      .toConstantValue(new TimeDifferenceFilter(container.get(TYPES.Sync_Timer)))
    container.bind<ContentTypeFilter>(TYPES.Sync_ContentTypeFilter).toConstantValue(new ContentTypeFilter())
    container.bind<ContentFilter>(TYPES.Sync_ContentFilter).toConstantValue(new ContentFilter())
    container
      .bind<SharedVaultFilter>(TYPES.Sync_SharedVaultFilter)
      .toConstantValue(
        new SharedVaultFilter(
          container.get(TYPES.Sync_DetermineSharedVaultOperationOnItem),
          container.get(TYPES.Sync_SharedVaultUserRepository),
        ),
      )
    container.bind<SharedVaultSnjsFilter>(TYPES.Sync_SharedVaultSnjsFilter).toConstantValue(new SharedVaultSnjsFilter())
    container
      .bind<ItemSaveValidatorInterface>(TYPES.Sync_ItemSaveValidator)
      .toConstantValue(
        new ItemSaveValidator([
          container.get(TYPES.Sync_OwnershipFilter),
          container.get(TYPES.Sync_TimeDifferenceFilter),
          container.get(TYPES.Sync_ContentTypeFilter),
          container.get(TYPES.Sync_ContentFilter),
          container.get(TYPES.Sync_SharedVaultFilter),
          container.get(TYPES.Sync_SharedVaultSnjsFilter),
        ]),
      )

    // use cases
    container
      .bind<GetItems>(TYPES.Sync_GetItems)
      .toConstantValue(
        new GetItems(
          container.get(TYPES.Sync_ItemRepositoryResolver),
          container.get(TYPES.Sync_SharedVaultUserRepository),
          container.get(TYPES.Sync_CONTENT_SIZE_TRANSFER_LIMIT),
          container.get(TYPES.Sync_ItemTransferCalculator),
          container.get(TYPES.Sync_Timer),
          container.get(TYPES.Sync_MAX_ITEMS_LIMIT),
        ),
      )
    container
      .bind<SaveNewItem>(TYPES.Sync_SaveNewItem)
      .toConstantValue(
        new SaveNewItem(
          container.get(TYPES.Sync_ItemRepositoryResolver),
          container.get(TYPES.Sync_Timer),
          container.get(TYPES.Sync_DomainEventPublisher),
          container.get(TYPES.Sync_DomainEventFactory),
        ),
      )
    container
      .bind<AddNotificationForUser>(TYPES.Sync_AddNotificationForUser)
      .toConstantValue(
        new AddNotificationForUser(container.get(TYPES.Sync_NotificationRepository), container.get(TYPES.Sync_Timer)),
      )
    container
      .bind<AddNotificationsForUsers>(TYPES.Sync_AddNotificationsForUsers)
      .toConstantValue(
        new AddNotificationsForUsers(
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Sync_SharedVaultUserRepository),
          container.get<AddNotificationForUser>(TYPES.Sync_AddNotificationForUser),
        ),
      )
    container
      .bind<RemoveNotificationsForUser>(TYPES.Sync_RemoveNotificationsForUser)
      .toConstantValue(new RemoveNotificationsForUser(container.get(TYPES.Sync_NotificationRepository)))
    container
      .bind<UpdateExistingItem>(TYPES.Sync_UpdateExistingItem)
      .toConstantValue(
        new UpdateExistingItem(
          container.get(TYPES.Sync_ItemRepositoryResolver),
          container.get(TYPES.Sync_Timer),
          container.get(TYPES.Sync_DomainEventPublisher),
          container.get(TYPES.Sync_DomainEventFactory),
          container.get(TYPES.Sync_REVISIONS_FREQUENCY),
          container.get(TYPES.Sync_DetermineSharedVaultOperationOnItem),
          container.get(TYPES.Sync_AddNotificationForUser),
          container.get(TYPES.Sync_RemoveNotificationsForUser),
        ),
      )
    container
      .bind<SaveItems>(TYPES.Sync_SaveItems)
      .toConstantValue(
        new SaveItems(
          container.get(TYPES.Sync_ItemSaveValidator),
          container.get(TYPES.Sync_ItemRepositoryResolver),
          container.get(TYPES.Sync_Timer),
          container.get(TYPES.Sync_SaveNewItem),
          container.get(TYPES.Sync_UpdateExistingItem),
          container.get(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<GetUserNotifications>(TYPES.Sync_GetUserNotifications)
      .toConstantValue(new GetUserNotifications(container.get(TYPES.Sync_NotificationRepository)))
    container
      .bind<GetSharedVaults>(TYPES.Sync_GetSharedVaults)
      .toConstantValue(
        new GetSharedVaults(
          container.get(TYPES.Sync_SharedVaultUserRepository),
          container.get(TYPES.Sync_SharedVaultRepository),
        ),
      )
    container
      .bind<GetSharedVaultInvitesSentToUser>(TYPES.Sync_GetSharedVaultInvitesSentToUser)
      .toConstantValue(new GetSharedVaultInvitesSentToUser(container.get(TYPES.Sync_SharedVaultInviteRepository)))
    container
      .bind<GetMessagesSentToUser>(TYPES.Sync_GetMessagesSentToUser)
      .toConstantValue(new GetMessagesSentToUser(container.get(TYPES.Sync_MessageRepository)))

    container
      .bind<SyncItems>(TYPES.Sync_SyncItems)
      .toConstantValue(
        new SyncItems(
          container.get(TYPES.Sync_ItemRepositoryResolver),
          container.get(TYPES.Sync_GetItems),
          container.get(TYPES.Sync_SaveItems),
          container.get(TYPES.Sync_GetSharedVaults),
          container.get(TYPES.Sync_GetSharedVaultInvitesSentToUser),
          container.get(TYPES.Sync_GetMessagesSentToUser),
          container.get(TYPES.Sync_GetUserNotifications),
        ),
      )
    container.bind<CheckIntegrity>(TYPES.Sync_CheckIntegrity).toDynamicValue((context: interfaces.Context) => {
      return new CheckIntegrity(context.container.get(TYPES.Sync_ItemRepositoryResolver))
    })
    container.bind<GetItem>(TYPES.Sync_GetItem).toDynamicValue((context: interfaces.Context) => {
      return new GetItem(context.container.get(TYPES.Sync_ItemRepositoryResolver))
    })
    container
      .bind<InviteUserToSharedVault>(TYPES.Sync_InviteUserToSharedVault)
      .toConstantValue(
        new InviteUserToSharedVault(
          container.get(TYPES.Sync_SharedVaultRepository),
          container.get(TYPES.Sync_SharedVaultInviteRepository),
          container.get(TYPES.Sync_SharedVaultUserRepository),
          container.get(TYPES.Sync_Timer),
        ),
      )
    container
      .bind<UpdateSharedVaultInvite>(TYPES.Sync_UpdateSharedVaultInvite)
      .toConstantValue(
        new UpdateSharedVaultInvite(
          container.get(TYPES.Sync_SharedVaultInviteRepository),
          container.get(TYPES.Sync_Timer),
        ),
      )
    container
      .bind<AddUserToSharedVault>(TYPES.Sync_AddUserToSharedVault)
      .toConstantValue(
        new AddUserToSharedVault(
          container.get(TYPES.Sync_SharedVaultRepository),
          container.get(TYPES.Sync_SharedVaultUserRepository),
          container.get(TYPES.Sync_Timer),
        ),
      )
    container
      .bind<AcceptInviteToSharedVault>(TYPES.Sync_AcceptInviteToSharedVault)
      .toConstantValue(
        new AcceptInviteToSharedVault(
          container.get(TYPES.Sync_AddUserToSharedVault),
          container.get(TYPES.Sync_SharedVaultInviteRepository),
        ),
      )
    container
      .bind<DeclineInviteToSharedVault>(TYPES.Sync_DeclineInviteToSharedVault)
      .toConstantValue(new DeclineInviteToSharedVault(container.get(TYPES.Sync_SharedVaultInviteRepository)))
    container
      .bind<DeleteSharedVaultInvitesToUser>(TYPES.Sync_DeleteSharedVaultInvitesToUser)
      .toConstantValue(
        new DeleteSharedVaultInvitesToUser(
          container.get(TYPES.Sync_SharedVaultInviteRepository),
          container.get(TYPES.Sync_DeclineInviteToSharedVault),
        ),
      )
    container
      .bind<DeleteSharedVaultInvitesSentByUser>(TYPES.Sync_DeleteSharedVaultInvitesSentByUser)
      .toConstantValue(
        new DeleteSharedVaultInvitesSentByUser(
          container.get(TYPES.Sync_SharedVaultInviteRepository),
          container.get(TYPES.Sync_DeclineInviteToSharedVault),
        ),
      )
    container
      .bind<GetSharedVaultInvitesSentByUser>(TYPES.Sync_GetSharedVaultInvitesSentByUser)
      .toConstantValue(new GetSharedVaultInvitesSentByUser(container.get(TYPES.Sync_SharedVaultInviteRepository)))
    container
      .bind<GetSharedVaultUsers>(TYPES.Sync_GetSharedVaultUsers)
      .toConstantValue(
        new GetSharedVaultUsers(
          container.get(TYPES.Sync_SharedVaultUserRepository),
          container.get(TYPES.Sync_SharedVaultRepository),
        ),
      )
    container
      .bind<RemoveUserFromSharedVault>(TYPES.Sync_RemoveSharedVaultUser)
      .toConstantValue(
        new RemoveUserFromSharedVault(
          container.get(TYPES.Sync_SharedVaultUserRepository),
          container.get(TYPES.Sync_SharedVaultRepository),
          container.get(TYPES.Sync_AddNotificationForUser),
        ),
      )
    container
      .bind<CreateSharedVault>(TYPES.Sync_CreateSharedVault)
      .toConstantValue(
        new CreateSharedVault(
          container.get(TYPES.Sync_AddUserToSharedVault),
          container.get(TYPES.Sync_SharedVaultRepository),
          container.get(TYPES.Sync_Timer),
        ),
      )
    container
      .bind<DeleteSharedVault>(TYPES.Sync_DeleteSharedVault)
      .toConstantValue(
        new DeleteSharedVault(
          container.get(TYPES.Sync_SharedVaultRepository),
          container.get(TYPES.Sync_SharedVaultUserRepository),
          container.get(TYPES.Sync_SharedVaultInviteRepository),
          container.get(TYPES.Sync_RemoveSharedVaultUser),
        ),
      )
    container
      .bind<CreateSharedVaultFileValetToken>(TYPES.Sync_CreateSharedVaultFileValetToken)
      .toConstantValue(
        new CreateSharedVaultFileValetToken(
          container.get(TYPES.Sync_SharedVaultRepository),
          container.get(TYPES.Sync_SharedVaultUserRepository),
          container.get(TYPES.Sync_SharedVaultValetTokenEncoder),
          container.get(TYPES.Sync_VALET_TOKEN_TTL),
        ),
      )
    container
      .bind<GetMessagesSentByUser>(TYPES.Sync_GetMessagesSentByUser)
      .toConstantValue(new GetMessagesSentByUser(container.get(TYPES.Sync_MessageRepository)))
    container
      .bind<SendMessageToUser>(TYPES.Sync_SendMessageToUser)
      .toConstantValue(
        new SendMessageToUser(container.get(TYPES.Sync_MessageRepository), container.get(TYPES.Sync_Timer)),
      )
    container
      .bind<DeleteMessage>(TYPES.Sync_DeleteMessage)
      .toConstantValue(new DeleteMessage(container.get(TYPES.Sync_MessageRepository)))
    container
      .bind<DeleteAllMessagesSentToUser>(TYPES.Sync_DeleteAllMessagesSentToUser)
      .toConstantValue(
        new DeleteAllMessagesSentToUser(
          container.get(TYPES.Sync_MessageRepository),
          container.get(TYPES.Sync_DeleteMessage),
        ),
      )
    container
      .bind<UpdateStorageQuotaUsedInSharedVault>(TYPES.Sync_UpdateStorageQuotaUsedInSharedVault)
      .toConstantValue(
        new UpdateStorageQuotaUsedInSharedVault(
          container.get<SharedVaultRepositoryInterface>(TYPES.Sync_SharedVaultRepository),
        ),
      )
    container
      .bind<TransitionItemsFromPrimaryToSecondaryDatabaseForUser>(
        TYPES.Sync_TransitionItemsFromPrimaryToSecondaryDatabaseForUser,
      )
      .toConstantValue(
        new TransitionItemsFromPrimaryToSecondaryDatabaseForUser(
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLLegacyItemRepository),
          isSecondaryDatabaseEnabled ? container.get<ItemRepositoryInterface>(TYPES.Sync_MongoDBItemRepository) : null,
          container.get<TimerInterface>(TYPES.Sync_Timer),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<TriggerTransitionFromPrimaryToSecondaryDatabaseForUser>(
        TYPES.Sync_TriggerTransitionFromPrimaryToSecondaryDatabaseForUser,
      )
      .toConstantValue(
        new TriggerTransitionFromPrimaryToSecondaryDatabaseForUser(
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
        ),
      )

    // Services
    container
      .bind<SyncResponseFactory20161215>(TYPES.Sync_SyncResponseFactory20161215)
      .toConstantValue(new SyncResponseFactory20161215(container.get(TYPES.Sync_ItemHttpMapper)))
    container
      .bind<SyncResponseFactory20200115>(TYPES.Sync_SyncResponseFactory20200115)
      .toConstantValue(
        new SyncResponseFactory20200115(
          container.get(TYPES.Sync_ItemHttpMapper),
          container.get(TYPES.Sync_ItemConflictHttpMapper),
          container.get(TYPES.Sync_SavedItemHttpMapper),
          container.get(TYPES.Sync_SharedVaultHttpMapper),
          container.get(TYPES.Sync_SharedVaultInviteHttpMapper),
          container.get(TYPES.Sync_MessageHttpMapper),
          container.get(TYPES.Sync_NotificationHttpMapper),
        ),
      )
    container
      .bind<SyncResponseFactoryResolverInterface>(TYPES.Sync_SyncResponseFactoryResolver)
      .toDynamicValue((context: interfaces.Context) => {
        return new SyncResponseFactoryResolver(
          context.container.get(TYPES.Sync_SyncResponseFactory20161215),
          context.container.get(TYPES.Sync_SyncResponseFactory20200115),
        )
      })

    container
      .bind<ItemBackupServiceInterface>(TYPES.Sync_ItemBackupService)
      .toConstantValue(
        env.get('S3_AWS_REGION', true)
          ? new S3ItemBackupService(
              container.get(TYPES.Sync_S3_BACKUP_BUCKET_NAME),
              container.get(TYPES.Sync_ItemBackupMapper),
              container.get(TYPES.Sync_ItemHttpMapper),
              container.get(TYPES.Sync_Logger),
              container.get(TYPES.Sync_S3),
            )
          : new FSItemBackupService(
              container.get(TYPES.Sync_FILE_UPLOAD_PATH),
              container.get(TYPES.Sync_ItemBackupMapper),
              container.get(TYPES.Sync_Logger),
            ),
      )

    // Handlers
    container
      .bind<DuplicateItemSyncedEventHandler>(TYPES.Sync_DuplicateItemSyncedEventHandler)
      .toConstantValue(
        new DuplicateItemSyncedEventHandler(
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLLegacyItemRepository),
          isSecondaryDatabaseEnabled ? container.get<ItemRepositoryInterface>(TYPES.Sync_MongoDBItemRepository) : null,
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.Sync_AccountDeletionRequestedEventHandler)
      .toConstantValue(
        new AccountDeletionRequestedEventHandler(
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLLegacyItemRepository),
          isSecondaryDatabaseEnabled ? container.get<ItemRepositoryInterface>(TYPES.Sync_MongoDBItemRepository) : null,
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<ItemRevisionCreationRequestedEventHandler>(TYPES.Sync_ItemRevisionCreationRequestedEventHandler)
      .toConstantValue(
        new ItemRevisionCreationRequestedEventHandler(
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLLegacyItemRepository),
          isSecondaryDatabaseEnabled ? container.get<ItemRepositoryInterface>(TYPES.Sync_MongoDBItemRepository) : null,
          container.get<ItemBackupServiceInterface>(TYPES.Sync_ItemBackupService),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
        ),
      )
    container
      .bind<SharedVaultFileUploadedEventHandler>(TYPES.Sync_SharedVaultFileUploadedEventHandler)
      .toConstantValue(
        new SharedVaultFileUploadedEventHandler(
          container.get<UpdateStorageQuotaUsedInSharedVault>(TYPES.Sync_UpdateStorageQuotaUsedInSharedVault),
          container.get<AddNotificationsForUsers>(TYPES.Sync_AddNotificationsForUsers),
          container.get<winston.Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<SharedVaultFileRemovedEventHandler>(TYPES.Sync_SharedVaultFileRemovedEventHandler)
      .toConstantValue(
        new SharedVaultFileRemovedEventHandler(
          container.get<UpdateStorageQuotaUsedInSharedVault>(TYPES.Sync_UpdateStorageQuotaUsedInSharedVault),
          container.get<AddNotificationsForUsers>(TYPES.Sync_AddNotificationsForUsers),
          container.get<winston.Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<SharedVaultFileMovedEventHandler>(TYPES.Sync_SharedVaultFileMovedEventHandler)
      .toConstantValue(
        new SharedVaultFileMovedEventHandler(
          container.get<UpdateStorageQuotaUsedInSharedVault>(TYPES.Sync_UpdateStorageQuotaUsedInSharedVault),
          container.get<AddNotificationsForUsers>(TYPES.Sync_AddNotificationsForUsers),
          container.get<winston.Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<TransitionStatusUpdatedEventHandler>(TYPES.Sync_TransitionStatusUpdatedEventHandler)
      .toConstantValue(
        new TransitionStatusUpdatedEventHandler(
          container.get<TransitionItemsFromPrimaryToSecondaryDatabaseForUser>(
            TYPES.Sync_TransitionItemsFromPrimaryToSecondaryDatabaseForUser,
          ),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )

    // Services
    container.bind<ContentDecoder>(TYPES.Sync_ContentDecoder).toDynamicValue(() => new ContentDecoder())
    container.bind<AxiosInstance>(TYPES.Sync_HTTPClient).toDynamicValue(() => axios.create())
    container
      .bind<ExtensionsHttpServiceInterface>(TYPES.Sync_ExtensionsHttpService)
      .toConstantValue(
        new ExtensionsHttpService(
          container.get<AxiosInstance>(TYPES.Sync_HTTPClient),
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLLegacyItemRepository),
          isSecondaryDatabaseEnabled ? container.get<ItemRepositoryInterface>(TYPES.Sync_MongoDBItemRepository) : null,
          container.get<ContentDecoderInterface>(TYPES.Sync_ContentDecoder),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['DUPLICATE_ITEM_SYNCED', container.get(TYPES.Sync_DuplicateItemSyncedEventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.Sync_AccountDeletionRequestedEventHandler)],
      ['ITEM_REVISION_CREATION_REQUESTED', container.get(TYPES.Sync_ItemRevisionCreationRequestedEventHandler)],
      [
        'SHARED_VAULT_FILE_UPLOADED',
        container.get<SharedVaultFileUploadedEventHandler>(TYPES.Sync_SharedVaultFileUploadedEventHandler),
      ],
      [
        'SHARED_VAULT_FILE_REMOVED',
        container.get<SharedVaultFileRemovedEventHandler>(TYPES.Sync_SharedVaultFileRemovedEventHandler),
      ],
      [
        'SHARED_VAULT_FILE_MOVED',
        container.get<SharedVaultFileMovedEventHandler>(TYPES.Sync_SharedVaultFileMovedEventHandler),
      ],
      [
        'TRANSITION_STATUS_UPDATED',
        container.get<TransitionStatusUpdatedEventHandler>(TYPES.Sync_TransitionStatusUpdatedEventHandler),
      ],
    ])
    if (!isConfiguredForHomeServer) {
      container.bind(TYPES.Sync_AUTH_SERVER_URL).toConstantValue(env.get('AUTH_SERVER_URL'))

      container
        .bind<AuthHttpServiceInterface>(TYPES.Sync_AuthHttpService)
        .toDynamicValue((context: interfaces.Context) => {
          return new AuthHttpService(
            context.container.get(TYPES.Sync_HTTPClient),
            context.container.get(TYPES.Sync_AUTH_SERVER_URL),
          )
        })

      container
        .bind<EmailBackupRequestedEventHandler>(TYPES.Sync_EmailBackupRequestedEventHandler)
        .toConstantValue(
          new EmailBackupRequestedEventHandler(
            container.get<ItemRepositoryInterface>(TYPES.Sync_SQLLegacyItemRepository),
            isSecondaryDatabaseEnabled
              ? container.get<ItemRepositoryInterface>(TYPES.Sync_MongoDBItemRepository)
              : null,
            container.get<AuthHttpServiceInterface>(TYPES.Sync_AuthHttpService),
            container.get<ItemBackupServiceInterface>(TYPES.Sync_ItemBackupService),
            container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
            container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
            container.get<number>(TYPES.Sync_EMAIL_ATTACHMENT_MAX_BYTE_SIZE),
            container.get<ItemTransferCalculatorInterface>(TYPES.Sync_ItemTransferCalculator),
            container.get<string>(TYPES.Sync_S3_BACKUP_BUCKET_NAME),
            container.get<Logger>(TYPES.Sync_Logger),
          ),
        )

      eventHandlers.set('EMAIL_BACKUP_REQUESTED', container.get(TYPES.Sync_EmailBackupRequestedEventHandler))
    }

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
        .bind<BaseItemsController>(TYPES.Sync_BaseItemsController)
        .toConstantValue(
          new BaseItemsController(
            container.get<SyncItems>(TYPES.Sync_SyncItems),
            container.get<CheckIntegrity>(TYPES.Sync_CheckIntegrity),
            container.get<GetItem>(TYPES.Sync_GetItem),
            container.get<TriggerTransitionFromPrimaryToSecondaryDatabaseForUser>(
              TYPES.Sync_TriggerTransitionFromPrimaryToSecondaryDatabaseForUser,
            ),
            container.get<MapperInterface<Item, ItemHttpRepresentation>>(TYPES.Sync_ItemHttpMapper),
            container.get<SyncResponseFactoryResolverInterface>(TYPES.Sync_SyncResponseFactoryResolver),
            container.get<ControllerContainerInterface>(TYPES.Sync_ControllerContainer),
          ),
        )
      container
        .bind<BaseSharedVaultInvitesController>(TYPES.Sync_BaseSharedVaultInvitesController)
        .toConstantValue(
          new BaseSharedVaultInvitesController(
            container.get(TYPES.Sync_InviteUserToSharedVault),
            container.get(TYPES.Sync_UpdateSharedVaultInvite),
            container.get(TYPES.Sync_AcceptInviteToSharedVault),
            container.get(TYPES.Sync_DeclineInviteToSharedVault),
            container.get(TYPES.Sync_DeleteSharedVaultInvitesToUser),
            container.get(TYPES.Sync_DeleteSharedVaultInvitesSentByUser),
            container.get(TYPES.Sync_GetSharedVaultInvitesSentByUser),
            container.get(TYPES.Sync_GetSharedVaultInvitesSentToUser),
            container.get(TYPES.Sync_SharedVaultInviteHttpMapper),
            container.get(TYPES.Sync_ControllerContainer),
          ),
        )
      container
        .bind<BaseSharedVaultUsersController>(TYPES.Sync_BaseSharedVaultUsersController)
        .toConstantValue(
          new BaseSharedVaultUsersController(
            container.get(TYPES.Sync_GetSharedVaultUsers),
            container.get(TYPES.Sync_RemoveSharedVaultUser),
            container.get(TYPES.Sync_SharedVaultUserHttpMapper),
            container.get(TYPES.Sync_ControllerContainer),
          ),
        )
      container
        .bind<BaseSharedVaultsController>(TYPES.Sync_BaseSharedVaultsController)
        .toConstantValue(
          new BaseSharedVaultsController(
            container.get(TYPES.Sync_GetSharedVaults),
            container.get(TYPES.Sync_CreateSharedVault),
            container.get(TYPES.Sync_DeleteSharedVault),
            container.get(TYPES.Sync_CreateSharedVaultFileValetToken),
            container.get(TYPES.Sync_SharedVaultHttpMapper),
            container.get(TYPES.Sync_SharedVaultUserHttpMapper),
            container.get(TYPES.Sync_ControllerContainer),
          ),
        )
      container
        .bind<BaseMessagesController>(TYPES.Sync_BaseMessagesController)
        .toConstantValue(
          new BaseMessagesController(
            container.get(TYPES.Sync_GetMessagesSentToUser),
            container.get(TYPES.Sync_GetMessagesSentByUser),
            container.get(TYPES.Sync_SendMessageToUser),
            container.get(TYPES.Sync_DeleteAllMessagesSentToUser),
            container.get(TYPES.Sync_DeleteMessage),
            container.get(TYPES.Sync_MessageHttpMapper),
            container.get(TYPES.Sync_ControllerContainer),
          ),
        )
    }

    logger.debug('Configuration complete')

    return container
  }
}
