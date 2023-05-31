import { ControllerContainer, ControllerContainerInterface, MapperInterface } from '@standardnotes/domain-core'
import { Container, interfaces } from 'inversify'
import { Repository } from 'typeorm'
import * as winston from 'winston'

import { Revision } from '../Domain/Revision/Revision'
import { RevisionMetadata } from '../Domain/Revision/RevisionMetadata'
import { RevisionRepositoryInterface } from '../Domain/Revision/RevisionRepositoryInterface'
import { TypeORMRevisionRepository } from '../Infra/TypeORM/TypeORMRevisionRepository'
import { TypeORMRevision } from '../Infra/TypeORM/TypeORMRevision'
import { RevisionMetadataPersistenceMapper } from '../Mapping/RevisionMetadataPersistenceMapper'
import { RevisionPersistenceMapper } from '../Mapping/RevisionPersistenceMapper'
import { AppDataSource } from './DataSource'
import { Env } from './Env'
import TYPES from './Types'
import { TokenDecoderInterface, CrossServiceTokenData, TokenDecoder } from '@standardnotes/security'
import { TimerInterface, Timer } from '@standardnotes/time'
import { ApiGatewayAuthMiddleware } from '../Infra/InversifyExpress/Middleware/ApiGatewayAuthMiddleware'
import { RevisionsController } from '../Controller/RevisionsController'
import { DeleteRevision } from '../Domain/UseCase/DeleteRevision/DeleteRevision'
import { GetRequiredRoleToViewRevision } from '../Domain/UseCase/GetRequiredRoleToViewRevision/GetRequiredRoleToViewRevision'
import { GetRevision } from '../Domain/UseCase/GetRevision/GetRevision'
import { GetRevisionsMetada } from '../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'
import { RevisionHttpMapper } from '../Mapping/RevisionHttpMapper'
import { RevisionMetadataHttpMapper } from '../Mapping/RevisionMetadataHttpMapper'
import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import {
  DomainEventMessageHandlerInterface,
  DomainEventHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import {
  SQSNewRelicEventMessageHandler,
  SQSEventMessageHandler,
  SQSDomainEventSubscriberFactory,
  DirectCallEventMessageHandler,
  DirectCallDomainEventPublisher,
} from '@standardnotes/domain-events-infra'
import { DumpRepositoryInterface } from '../Domain/Dump/DumpRepositoryInterface'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { ItemDumpedEventHandler } from '../Domain/Handler/ItemDumpedEventHandler'
import { RevisionsCopyRequestedEventHandler } from '../Domain/Handler/RevisionsCopyRequestedEventHandler'
import { CopyRevisions } from '../Domain/UseCase/CopyRevisions/CopyRevisions'
import { FSDumpRepository } from '../Infra/FS/FSDumpRepository'
import { S3DumpRepository } from '../Infra/S3/S3ItemDumpRepository'
import { RevisionItemStringMapper } from '../Mapping/RevisionItemStringMapper'
import { HomeServerRevisionsController } from '../Infra/InversifyExpress/HomeServer/HomeServerRevisionsController'
import { Transform } from 'stream'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicFormatter = require('@newrelic/winston-enricher')

export class ContainerConfigLoader {
  async load(configuration?: {
    controllerConatiner?: ControllerContainerInterface
    directCallDomainEventPublisher?: DirectCallDomainEventPublisher
    logger?: Transform
  }): Promise<Container> {
    const directCallDomainEventPublisher =
      configuration?.directCallDomainEventPublisher ?? new DirectCallDomainEventPublisher()

    const env: Env = new Env()
    env.load()

    const isConfiguredForHomeServer = env.get('DB_TYPE') === 'sqlite'

    const container = new Container({
      defaultScope: 'Singleton',
    })

    await AppDataSource.initialize()

    container.bind<Env>(TYPES.Revisions_Env).toConstantValue(env)

    if (configuration?.logger) {
      container.bind<winston.Logger>(TYPES.Revisions_Logger).toConstantValue(configuration.logger as winston.Logger)
    } else {
      container.bind<winston.Logger>(TYPES.Revisions_Logger).toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Revisions_Env)

        const newrelicWinstonFormatter = newrelicFormatter(winston)
        const winstonFormatters = [winston.format.splat(), winston.format.json()]
        if (env.get('NEW_RELIC_ENABLED', true) === 'true') {
          winstonFormatters.push(newrelicWinstonFormatter())
        }

        const logger = winston.createLogger({
          level: env.get('LOG_LEVEL') || 'info',
          format: winston.format.combine(...winstonFormatters),
          transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' })],
          defaultMeta: { service: 'revisions' },
        })

        return logger
      })
    }

    container.bind(TYPES.Revisions_NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.Revisions_VERSION).toConstantValue(env.get('VERSION'))

    // Map
    container
      .bind<MapperInterface<RevisionMetadata, TypeORMRevision>>(TYPES.Revisions_RevisionMetadataPersistenceMapper)
      .toDynamicValue(() => new RevisionMetadataPersistenceMapper())
    container
      .bind<MapperInterface<Revision, TypeORMRevision>>(TYPES.Revisions_RevisionPersistenceMapper)
      .toDynamicValue(() => new RevisionPersistenceMapper())

    // ORM
    container
      .bind<Repository<TypeORMRevision>>(TYPES.Revisions_ORMRevisionRepository)
      .toDynamicValue(() => AppDataSource.getRepository(TypeORMRevision))

    // Repositories
    container
      .bind<RevisionRepositoryInterface>(TYPES.Revisions_RevisionRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMRevisionRepository(
          context.container.get(TYPES.Revisions_ORMRevisionRepository),
          context.container.get(TYPES.Revisions_RevisionMetadataPersistenceMapper),
          context.container.get(TYPES.Revisions_RevisionPersistenceMapper),
          context.container.get(TYPES.Revisions_Logger),
        )
      })

    container.bind<TimerInterface>(TYPES.Revisions_Timer).toDynamicValue(() => new Timer())

    container
      .bind<GetRequiredRoleToViewRevision>(TYPES.Revisions_GetRequiredRoleToViewRevision)
      .toDynamicValue((context: interfaces.Context) => {
        return new GetRequiredRoleToViewRevision(context.container.get(TYPES.Revisions_Timer))
      })

    // Map
    container
      .bind<
        MapperInterface<
          Revision,
          {
            uuid: string
            item_uuid: string
            content: string | null
            content_type: string
            items_key_id: string | null
            enc_item_key: string | null
            auth_hash: string | null
            created_at: string
            updated_at: string
          }
        >
      >(TYPES.Revisions_RevisionHttpMapper)
      .toDynamicValue(() => new RevisionHttpMapper())
    container
      .bind<
        MapperInterface<
          RevisionMetadata,
          {
            uuid: string
            content_type: string
            created_at: string
            updated_at: string
          }
        >
      >(TYPES.Revisions_RevisionMetadataHttpMapper)
      .toDynamicValue((context: interfaces.Context) => {
        return new RevisionMetadataHttpMapper(context.container.get(TYPES.Revisions_GetRequiredRoleToViewRevision))
      })

    // use cases
    container
      .bind<GetRevisionsMetada>(TYPES.Revisions_GetRevisionsMetada)
      .toDynamicValue((context: interfaces.Context) => {
        return new GetRevisionsMetada(context.container.get(TYPES.Revisions_RevisionRepository))
      })
    container.bind<GetRevision>(TYPES.Revisions_GetRevision).toDynamicValue((context: interfaces.Context) => {
      return new GetRevision(context.container.get(TYPES.Revisions_RevisionRepository))
    })
    container.bind<DeleteRevision>(TYPES.Revisions_DeleteRevision).toDynamicValue((context: interfaces.Context) => {
      return new DeleteRevision(context.container.get(TYPES.Revisions_RevisionRepository))
    })

    // env vars
    container.bind(TYPES.Revisions_AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))

    // Controller
    container
      .bind<ControllerContainerInterface>(TYPES.Revisions_ControllerContainer)
      .toConstantValue(configuration?.controllerConatiner ?? new ControllerContainer())

    container
      .bind<RevisionsController>(TYPES.Revisions_RevisionsController)
      .toDynamicValue((context: interfaces.Context) => {
        return new RevisionsController(
          context.container.get(TYPES.Revisions_GetRevisionsMetada),
          context.container.get(TYPES.Revisions_GetRevision),
          context.container.get(TYPES.Revisions_DeleteRevision),
          context.container.get(TYPES.Revisions_RevisionHttpMapper),
          context.container.get(TYPES.Revisions_RevisionMetadataHttpMapper),
          context.container.get(TYPES.Revisions_Logger),
        )
      })

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

    // Map
    container
      .bind<MapperInterface<Revision, string>>(TYPES.Revisions_RevisionItemStringMapper)
      .toDynamicValue(() => new RevisionItemStringMapper())

    if (!isConfiguredForHomeServer) {
      // env vars
      container.bind(TYPES.Revisions_SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))
      container.bind(TYPES.Revisions_S3_AWS_REGION).toConstantValue(env.get('S3_AWS_REGION', true))
      container.bind(TYPES.Revisions_S3_BACKUP_BUCKET_NAME).toConstantValue(env.get('S3_BACKUP_BUCKET_NAME', true))

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
    }

    container
      .bind<DumpRepositoryInterface>(TYPES.Revisions_DumpRepository)
      .toConstantValue(
        env.get('S3_AWS_REGION', true)
          ? new S3DumpRepository(
              container.get(TYPES.Revisions_S3_BACKUP_BUCKET_NAME),
              container.get(TYPES.Revisions_S3),
              container.get(TYPES.Revisions_RevisionItemStringMapper),
              container.get(TYPES.Revisions_Logger),
            )
          : new FSDumpRepository(container.get(TYPES.Revisions_RevisionItemStringMapper)),
      )

    // use cases
    container.bind<CopyRevisions>(TYPES.Revisions_CopyRevisions).toDynamicValue((context: interfaces.Context) => {
      return new CopyRevisions(context.container.get(TYPES.Revisions_RevisionRepository))
    })

    // Handlers
    container
      .bind<ItemDumpedEventHandler>(TYPES.Revisions_ItemDumpedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemDumpedEventHandler(
          context.container.get(TYPES.Revisions_DumpRepository),
          context.container.get(TYPES.Revisions_RevisionRepository),
        )
      })
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.Revisions_AccountDeletionRequestedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new AccountDeletionRequestedEventHandler(
          context.container.get(TYPES.Revisions_RevisionRepository),
          context.container.get(TYPES.Revisions_Logger),
        )
      })
    container
      .bind<RevisionsCopyRequestedEventHandler>(TYPES.Revisions_RevisionsCopyRequestedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new RevisionsCopyRequestedEventHandler(
          context.container.get(TYPES.Revisions_CopyRevisions),
          context.container.get(TYPES.Revisions_Logger),
        )
      })

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['ITEM_DUMPED', container.get(TYPES.Revisions_ItemDumpedEventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.Revisions_AccountDeletionRequestedEventHandler)],
      ['REVISIONS_COPY_REQUESTED', container.get(TYPES.Revisions_RevisionsCopyRequestedEventHandler)],
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
          env.get('NEW_RELIC_ENABLED', true) === 'true'
            ? new SQSNewRelicEventMessageHandler(eventHandlers, container.get(TYPES.Revisions_Logger))
            : new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Revisions_Logger)),
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
        .bind<HomeServerRevisionsController>(TYPES.Revisions_HomeServerRevisionsController)
        .toConstantValue(
          new HomeServerRevisionsController(
            container.get(TYPES.Revisions_RevisionsController),
            container.get(TYPES.Revisions_ControllerContainer),
          ),
        )
    }

    return container
  }
}
