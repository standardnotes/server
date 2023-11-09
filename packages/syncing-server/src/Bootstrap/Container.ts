import * as winston from 'winston'
import { Container, interfaces } from 'inversify'

import { Env } from './Env'
import TYPES from './Types'
import { AppDataSource } from './DataSource'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { ItemRepositoryInterface } from '../Domain/Item/ItemRepositoryInterface'
import { Repository } from 'typeorm'
import { Item } from '../Domain/Item/Item'
import {
  DirectCallDomainEventPublisher,
  DirectCallEventMessageHandler,
  SNSDomainEventPublisher,
  SQSDomainEventSubscriber,
  SQSEventMessageHandler,
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
  DomainEventPublisherInterface,
  DomainEventSubscriberInterface,
} from '@standardnotes/domain-events'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { DuplicateItemSyncedEventHandler } from '../Domain/Handler/DuplicateItemSyncedEventHandler'
import { EmailBackupRequestedEventHandler } from '../Domain/Handler/EmailBackupRequestedEventHandler'
import { ItemRevisionCreationRequestedEventHandler } from '../Domain/Handler/ItemRevisionCreationRequestedEventHandler'
import { ItemBackupServiceInterface } from '../Domain/Item/ItemBackupServiceInterface'
import { FSItemBackupService } from '../Infra/FS/FSItemBackupService'
import { S3ItemBackupService } from '../Infra/S3/S3ItemBackupService'
import {
  ControllerContainer,
  ControllerContainerInterface,
  MapperInterface,
  SharedVaultUser,
} from '@standardnotes/domain-core'
import { BaseItemsController } from '../Infra/InversifyExpressUtils/Base/BaseItemsController'
import { Transform } from 'stream'
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
import { CancelInviteToSharedVault } from '../Domain/UseCase/SharedVaults/CancelInviteToSharedVault/CancelInviteToSharedVault'
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
import { Logger } from 'winston'
import { SharedVaultFileMovedEventHandler } from '../Domain/Handler/SharedVaultFileMovedEventHandler'
import { SQLItem } from '../Infra/TypeORM/SQLItem'
import { SQLItemPersistenceMapper } from '../Mapping/Persistence/SQLItemPersistenceMapper'
import { SQLItemRepository } from '../Infra/TypeORM/SQLItemRepository'
import { SendEventToClient } from '../Domain/UseCase/Syncing/SendEventToClient/SendEventToClient'
import { DeleteSharedVaults } from '../Domain/UseCase/SharedVaults/DeleteSharedVaults/DeleteSharedVaults'
import { RemoveItemsFromSharedVault } from '../Domain/UseCase/SharedVaults/RemoveItemsFromSharedVault/RemoveItemsFromSharedVault'
import { SharedVaultRemovedEventHandler } from '../Domain/Handler/SharedVaultRemovedEventHandler'
import { DesignateSurvivor } from '../Domain/UseCase/SharedVaults/DesignateSurvivor/DesignateSurvivor'
import { RemoveUserFromSharedVaults } from '../Domain/UseCase/SharedVaults/RemoveUserFromSharedVaults/RemoveUserFromSharedVaults'
import { TransferSharedVault } from '../Domain/UseCase/SharedVaults/TransferSharedVault/TransferSharedVault'
import { TransferSharedVaultItems } from '../Domain/UseCase/SharedVaults/TransferSharedVaultItems/TransferSharedVaultItems'
import { DumpItem } from '../Domain/UseCase/Syncing/DumpItem/DumpItem'

export class ContainerConfigLoader {
  private readonly DEFAULT_CONTENT_SIZE_TRANSFER_LIMIT = 10_000_000
  private readonly DEFAULT_MAX_ITEMS_LIMIT = 300
  private readonly DEFAULT_FILE_UPLOAD_PATH = `${__dirname}/../../uploads`

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

    const container = new Container({
      defaultScope: 'Singleton',
    })

    let logger: winston.Logger
    if (configuration?.logger) {
      logger = configuration.logger as winston.Logger
    } else {
      const winstonFormatters = [winston.format.splat(), winston.format.json()]

      logger = winston.createLogger({
        level: env.get('LOG_LEVEL', true) || 'info',
        format: winston.format.combine(...winstonFormatters),
        transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL', true) || 'info' })],
        defaultMeta: { service: 'syncing-server' },
      })
    }
    container.bind<winston.Logger>(TYPES.Sync_Logger).toConstantValue(logger)

    const appDataSource = new AppDataSource({ env, runMigrations: this.mode === 'server' })
    await appDataSource.initialize()

    logger.debug('Database initialized')

    container.bind<TimerInterface>(TYPES.Sync_Timer).toConstantValue(new Timer())

    const isConfiguredForHomeServer = env.get('MODE', true) === 'home-server'
    const isConfiguredForSelfHosting = env.get('MODE', true) === 'self-hosted'
    const isConfiguredForHomeServerOrSelfHosting = isConfiguredForHomeServer || isConfiguredForSelfHosting

    container
      .bind<boolean>(TYPES.Sync_IS_CONFIGURED_FOR_HOME_SERVER_OR_SELF_HOSTING)
      .toConstantValue(isConfiguredForHomeServerOrSelfHosting)

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
      const sqsClient = new SQSClient(sqsConfig)
      container.bind<SQSClient>(TYPES.Sync_SQS).toConstantValue(sqsClient)

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
    container
      .bind(TYPES.Sync_FILE_UPLOAD_PATH)
      .toConstantValue(
        env.get('FILE_UPLOAD_PATH', true) ? env.get('FILE_UPLOAD_PATH', true) : this.DEFAULT_FILE_UPLOAD_PATH,
      )

    // Mapping
    container
      .bind<MapperInterface<Item, SQLItem>>(TYPES.Sync_SQLItemPersistenceMapper)
      .toConstantValue(new SQLItemPersistenceMapper())
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
      .bind<Repository<SQLItem>>(TYPES.Sync_ORMItemRepository)
      .toConstantValue(appDataSource.getRepository(SQLItem))
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

    // Repositories
    container
      .bind<ItemRepositoryInterface>(TYPES.Sync_SQLItemRepository)
      .toConstantValue(
        new SQLItemRepository(
          container.get<Repository<SQLItem>>(TYPES.Sync_ORMItemRepository),
          container.get<MapperInterface<Item, SQLItem>>(TYPES.Sync_SQLItemPersistenceMapper),
          container.get<Logger>(TYPES.Sync_Logger),
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

    // use cases
    container
      .bind<GetItems>(TYPES.Sync_GetItems)
      .toConstantValue(
        new GetItems(
          container.get(TYPES.Sync_SQLItemRepository),
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
          container.get(TYPES.Sync_SQLItemRepository),
          container.get(TYPES.Sync_Timer),
          container.get(TYPES.Sync_DomainEventPublisher),
          container.get(TYPES.Sync_DomainEventFactory),
        ),
      )
    container
      .bind<SendEventToClient>(TYPES.Sync_SendEventToClient)
      .toConstantValue(
        new SendEventToClient(
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<AddNotificationForUser>(TYPES.Sync_AddNotificationForUser)
      .toConstantValue(
        new AddNotificationForUser(
          container.get<NotificationRepositoryInterface>(TYPES.Sync_NotificationRepository),
          container.get<TimerInterface>(TYPES.Sync_Timer),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<SendEventToClient>(TYPES.Sync_SendEventToClient),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
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
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLItemRepository),
          container.get<TimerInterface>(TYPES.Sync_Timer),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<number>(TYPES.Sync_REVISIONS_FREQUENCY),
          container.get<DetermineSharedVaultOperationOnItem>(TYPES.Sync_DetermineSharedVaultOperationOnItem),
          container.get<AddNotificationsForUsers>(TYPES.Sync_AddNotificationsForUsers),
          container.get<RemoveNotificationsForUser>(TYPES.Sync_RemoveNotificationsForUser),
        ),
      )
    container
      .bind<SaveItems>(TYPES.Sync_SaveItems)
      .toConstantValue(
        new SaveItems(
          container.get(TYPES.Sync_ItemSaveValidator),
          container.get(TYPES.Sync_SQLItemRepository),
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
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLItemRepository),
          container.get<GetItems>(TYPES.Sync_GetItems),
          container.get<SaveItems>(TYPES.Sync_SaveItems),
          container.get<GetSharedVaults>(TYPES.Sync_GetSharedVaults),
          container.get<GetSharedVaultInvitesSentToUser>(TYPES.Sync_GetSharedVaultInvitesSentToUser),
          container.get<GetMessagesSentToUser>(TYPES.Sync_GetMessagesSentToUser),
          container.get<GetUserNotifications>(TYPES.Sync_GetUserNotifications),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )
    container.bind<CheckIntegrity>(TYPES.Sync_CheckIntegrity).toDynamicValue((context: interfaces.Context) => {
      return new CheckIntegrity(context.container.get(TYPES.Sync_SQLItemRepository))
    })
    container.bind<GetItem>(TYPES.Sync_GetItem).toDynamicValue((context: interfaces.Context) => {
      return new GetItem(context.container.get(TYPES.Sync_SQLItemRepository))
    })
    container
      .bind<InviteUserToSharedVault>(TYPES.Sync_InviteUserToSharedVault)
      .toConstantValue(
        new InviteUserToSharedVault(
          container.get<SharedVaultRepositoryInterface>(TYPES.Sync_SharedVaultRepository),
          container.get<SharedVaultInviteRepositoryInterface>(TYPES.Sync_SharedVaultInviteRepository),
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Sync_SharedVaultUserRepository),
          container.get<TimerInterface>(TYPES.Sync_Timer),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<SendEventToClient>(TYPES.Sync_SendEventToClient),
          container.get<Logger>(TYPES.Sync_Logger),
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
          container.get<SharedVaultRepositoryInterface>(TYPES.Sync_SharedVaultRepository),
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Sync_SharedVaultUserRepository),
          container.get<TimerInterface>(TYPES.Sync_Timer),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<AddNotificationsForUsers>(TYPES.Sync_AddNotificationsForUsers),
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
      .bind<CancelInviteToSharedVault>(TYPES.Sync_DeclineInviteToSharedVault)
      .toConstantValue(
        new CancelInviteToSharedVault(
          container.get<SharedVaultInviteRepositoryInterface>(TYPES.Sync_SharedVaultInviteRepository),
          container.get<AddNotificationForUser>(TYPES.Sync_AddNotificationForUser),
        ),
      )
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
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Sync_SharedVaultUserRepository),
          container.get<SharedVaultRepositoryInterface>(TYPES.Sync_SharedVaultRepository),
          container.get<AddNotificationsForUsers>(TYPES.Sync_AddNotificationsForUsers),
          container.get<AddNotificationForUser>(TYPES.Sync_AddNotificationForUser),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
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
        new SendMessageToUser(
          container.get<MessageRepositoryInterface>(TYPES.Sync_MessageRepository),
          container.get<TimerInterface>(TYPES.Sync_Timer),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<SendEventToClient>(TYPES.Sync_SendEventToClient),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
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
      .bind<RemoveItemsFromSharedVault>(TYPES.Sync_RemoveItemsFromSharedVault)
      .toConstantValue(
        new RemoveItemsFromSharedVault(container.get<ItemRepositoryInterface>(TYPES.Sync_SQLItemRepository)),
      )
    container
      .bind<DesignateSurvivor>(TYPES.Sync_DesignateSurvivor)
      .toConstantValue(
        new DesignateSurvivor(
          container.get<SharedVaultRepositoryInterface>(TYPES.Sync_SharedVaultRepository),
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Sync_SharedVaultUserRepository),
          container.get<TimerInterface>(TYPES.Sync_Timer),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<AddNotificationForUser>(TYPES.Sync_AddNotificationForUser),
        ),
      )
    container
      .bind<RemoveUserFromSharedVaults>(TYPES.Sync_RemoveUserFromSharedVaults)
      .toConstantValue(
        new RemoveUserFromSharedVaults(
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Sync_SharedVaultUserRepository),
          container.get<RemoveUserFromSharedVault>(TYPES.Sync_RemoveSharedVaultUser),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<TransferSharedVaultItems>(TYPES.Sync_TransferSharedVaultItems)
      .toConstantValue(
        new TransferSharedVaultItems(container.get<ItemRepositoryInterface>(TYPES.Sync_SQLItemRepository)),
      )
    container
      .bind<TransferSharedVault>(TYPES.Sync_TransferSharedVault)
      .toConstantValue(
        new TransferSharedVault(
          container.get<SharedVaultRepositoryInterface>(TYPES.Sync_SharedVaultRepository),
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Sync_SharedVaultUserRepository),
          container.get<TransferSharedVaultItems>(TYPES.Sync_TransferSharedVaultItems),
          container.get<TimerInterface>(TYPES.Sync_Timer),
        ),
      )
    container
      .bind<DeleteSharedVault>(TYPES.Sync_DeleteSharedVault)
      .toConstantValue(
        new DeleteSharedVault(
          container.get<SharedVaultRepositoryInterface>(TYPES.Sync_SharedVaultRepository),
          container.get<SharedVaultUserRepositoryInterface>(TYPES.Sync_SharedVaultUserRepository),
          container.get<SharedVaultInviteRepositoryInterface>(TYPES.Sync_SharedVaultInviteRepository),
          container.get<RemoveUserFromSharedVault>(TYPES.Sync_RemoveSharedVaultUser),
          container.get<CancelInviteToSharedVault>(TYPES.Sync_DeclineInviteToSharedVault),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<TransferSharedVault>(TYPES.Sync_TransferSharedVault),
        ),
      )
    container
      .bind<DeleteSharedVaults>(TYPES.Sync_DeleteSharedVaults)
      .toConstantValue(
        new DeleteSharedVaults(
          container.get<SharedVaultRepositoryInterface>(TYPES.Sync_SharedVaultRepository),
          container.get<DeleteSharedVault>(TYPES.Sync_DeleteSharedVault),
        ),
      )
    container
      .bind<DumpItem>(TYPES.Sync_DumpItem)
      .toConstantValue(
        new DumpItem(
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLItemRepository),
          container.get<ItemBackupServiceInterface>(TYPES.Sync_ItemBackupService),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
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

    // Handlers
    container
      .bind<DuplicateItemSyncedEventHandler>(TYPES.Sync_DuplicateItemSyncedEventHandler)
      .toConstantValue(
        new DuplicateItemSyncedEventHandler(
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLItemRepository),
          container.get<DomainEventFactoryInterface>(TYPES.Sync_DomainEventFactory),
          container.get<DomainEventPublisherInterface>(TYPES.Sync_DomainEventPublisher),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.Sync_AccountDeletionRequestedEventHandler)
      .toConstantValue(
        new AccountDeletionRequestedEventHandler(
          container.get<ItemRepositoryInterface>(TYPES.Sync_SQLItemRepository),
          container.get<DeleteSharedVaults>(TYPES.Sync_DeleteSharedVaults),
          container.get<RemoveUserFromSharedVaults>(TYPES.Sync_RemoveUserFromSharedVaults),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )
    container
      .bind<ItemRevisionCreationRequestedEventHandler>(TYPES.Sync_ItemRevisionCreationRequestedEventHandler)
      .toConstantValue(
        new ItemRevisionCreationRequestedEventHandler(
          container.get<DumpItem>(TYPES.Sync_DumpItem),
          container.get<Logger>(TYPES.Sync_Logger),
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
      .bind<SharedVaultRemovedEventHandler>(TYPES.Sync_SharedVaultRemovedEventHandler)
      .toConstantValue(
        new SharedVaultRemovedEventHandler(
          container.get<RemoveItemsFromSharedVault>(TYPES.Sync_RemoveItemsFromSharedVault),
          container.get<Logger>(TYPES.Sync_Logger),
        ),
      )

    // Services
    container.bind<ContentDecoderInterface>(TYPES.Sync_ContentDecoder).toDynamicValue(() => new ContentDecoder())

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
        'SHARED_VAULT_REMOVED',
        container.get<SharedVaultRemovedEventHandler>(TYPES.Sync_SharedVaultRemovedEventHandler),
      ],
    ])
    if (!isConfiguredForHomeServer) {
      container
        .bind<EmailBackupRequestedEventHandler>(TYPES.Sync_EmailBackupRequestedEventHandler)
        .toConstantValue(
          new EmailBackupRequestedEventHandler(
            container.get<ItemRepositoryInterface>(TYPES.Sync_SQLItemRepository),
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
        .toConstantValue(new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Sync_Logger)))

      container
        .bind<DomainEventSubscriberInterface>(TYPES.Sync_DomainEventSubscriber)
        .toConstantValue(
          new SQSDomainEventSubscriber(
            container.get<SQSClient>(TYPES.Sync_SQS),
            container.get<string>(TYPES.Sync_SQS_QUEUE_URL),
            container.get<DomainEventMessageHandlerInterface>(TYPES.Sync_DomainEventMessageHandler),
            container.get<Logger>(TYPES.Sync_Logger),
          ),
        )
    }

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
            container.get<GetSharedVaultUsers>(TYPES.Sync_GetSharedVaultUsers),
            container.get<RemoveUserFromSharedVault>(TYPES.Sync_RemoveSharedVaultUser),
            container.get<DesignateSurvivor>(TYPES.Sync_DesignateSurvivor),
            container.get<MapperInterface<SharedVaultUser, SharedVaultUserHttpRepresentation>>(
              TYPES.Sync_SharedVaultUserHttpMapper,
            ),
            container.get<ControllerContainerInterface>(TYPES.Sync_ControllerContainer),
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
