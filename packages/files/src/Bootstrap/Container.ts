import * as winston from 'winston'
import Redis from 'ioredis'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3'
import { Container } from 'inversify'

import { Env } from './Env'
import TYPES from './Types'
import { UploadFileChunk } from '../Domain/UseCase/UploadFileChunk/UploadFileChunk'
import { ValetTokenAuthMiddleware } from '../Infra/InversifyExpress/Middleware/ValetTokenAuthMiddleware'
import { TokenDecoder, TokenDecoderInterface, ValetTokenData } from '@standardnotes/security'
import { Timer, TimerInterface } from '@standardnotes/time'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { DomainEventFactory } from '../Domain/Event/DomainEventFactory'
import {
  DirectCallDomainEventPublisher,
  DirectCallEventMessageHandler,
  SNSDomainEventPublisher,
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { StreamDownloadFile } from '../Domain/UseCase/StreamDownloadFile/StreamDownloadFile'
import { FileDownloaderInterface } from '../Domain/Services/FileDownloaderInterface'
import { S3FileDownloader } from '../Infra/S3/S3FileDownloader'
import { FileUploaderInterface } from '../Domain/Services/FileUploaderInterface'
import { S3FileUploader } from '../Infra/S3/S3FileUploader'
import { FSFileDownloader } from '../Infra/FS/FSFileDownloader'
import { FSFileUploader } from '../Infra/FS/FSFileUploader'
import { CreateUploadSession } from '../Domain/UseCase/CreateUploadSession/CreateUploadSession'
import { FinishUploadSession } from '../Domain/UseCase/FinishUploadSession/FinishUploadSession'
import { UploadRepositoryInterface } from '../Domain/Upload/UploadRepositoryInterface'
import { RedisUploadRepository } from '../Infra/Redis/RedisUploadRepository'
import { GetFileMetadata } from '../Domain/UseCase/GetFileMetadata/GetFileMetadata'
import { FileRemoverInterface } from '../Domain/Services/FileRemoverInterface'
import { S3FileRemover } from '../Infra/S3/S3FileRemover'
import { FSFileRemover } from '../Infra/FS/FSFileRemover'
import { RemoveFile } from '../Domain/UseCase/RemoveFile/RemoveFile'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventPublisherInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import { MarkFilesToBeRemoved } from '../Domain/UseCase/MarkFilesToBeRemoved/MarkFilesToBeRemoved'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { SharedSubscriptionInvitationCanceledEventHandler } from '../Domain/Handler/SharedSubscriptionInvitationCanceledEventHandler'
import { InMemoryUploadRepository } from '../Infra/InMemory/InMemoryUploadRepository'
import { Transform } from 'stream'

export class ContainerConfigLoader {
  async load(configuration?: {
    directCallDomainEventPublisher?: DirectCallDomainEventPublisher
    logger?: Transform
  }): Promise<Container> {
    const directCallDomainEventPublisher =
      configuration?.directCallDomainEventPublisher ?? new DirectCallDomainEventPublisher()

    const env: Env = new Env()
    env.load()

    const container = new Container()

    if (env.get('NEW_RELIC_ENABLED', true) === 'true') {
      await import('newrelic')
    }

    const isConfiguredForHomeServer = env.get('CACHE_TYPE') === 'memory'

    if (configuration?.logger) {
      container.bind<winston.Logger>(TYPES.Files_Logger).toConstantValue(configuration.logger as winston.Logger)
    } else {
      container.bind<winston.Logger>(TYPES.Files_Logger).toConstantValue(this.createLogger({ env }))
    }

    container.bind<TimerInterface>(TYPES.Files_Timer).toConstantValue(new Timer())

    if (isConfiguredForHomeServer) {
      container
        .bind<UploadRepositoryInterface>(TYPES.Files_UploadRepository)
        .toConstantValue(new InMemoryUploadRepository(container.get(TYPES.Files_Timer)))

      container
        .bind<DomainEventPublisherInterface>(TYPES.Files_DomainEventPublisher)
        .toConstantValue(directCallDomainEventPublisher)
    } else {
      container.bind(TYPES.Files_S3_BUCKET_NAME).toConstantValue(env.get('S3_BUCKET_NAME', true))
      container.bind(TYPES.Files_S3_AWS_REGION).toConstantValue(env.get('S3_AWS_REGION', true))
      container.bind(TYPES.Files_SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN'))
      container.bind(TYPES.Files_SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
      container.bind(TYPES.Files_SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))
      container.bind(TYPES.Files_REDIS_URL).toConstantValue(env.get('REDIS_URL'))

      const redisUrl = container.get(TYPES.Files_REDIS_URL) as string
      const isRedisInClusterMode = redisUrl.indexOf(',') > 0
      let redis
      if (isRedisInClusterMode) {
        redis = new Redis.Cluster(redisUrl.split(','))
      } else {
        redis = new Redis(redisUrl)
      }

      container.bind(TYPES.Files_Redis).toConstantValue(redis)

      if (env.get('SNS_TOPIC_ARN', true)) {
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
        container.bind<SNSClient>(TYPES.Files_SNS).toConstantValue(new SNSClient(snsConfig))
      }

      if (env.get('SQS_QUEUE_URL', true)) {
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
        container.bind<SQSClient>(TYPES.Files_SQS).toConstantValue(new SQSClient(sqsConfig))
      }

      container.bind<UploadRepositoryInterface>(TYPES.Files_UploadRepository).to(RedisUploadRepository)

      container
        .bind<DomainEventPublisherInterface>(TYPES.Files_DomainEventPublisher)
        .toConstantValue(
          new SNSDomainEventPublisher(container.get(TYPES.Files_SNS), container.get(TYPES.Files_SNS_TOPIC_ARN)),
        )
    }

    // env vars
    container.bind(TYPES.Files_VALET_TOKEN_SECRET).toConstantValue(env.get('VALET_TOKEN_SECRET'))
    container
      .bind(TYPES.Files_MAX_CHUNK_BYTES)
      .toConstantValue(env.get('MAX_CHUNK_BYTES', true) ? +env.get('MAX_CHUNK_BYTES', true) : 100000000)
    container.bind(TYPES.Files_VERSION).toConstantValue(env.get('VERSION', true) ?? 'development')
    container
      .bind(TYPES.Files_FILE_UPLOAD_PATH)
      .toConstantValue(env.get('FILE_UPLOAD_PATH', true) ?? `${__dirname}/../../uploads`)

    if (env.get('S3_AWS_REGION', true) || env.get('S3_ENDPOINT', true)) {
      const s3Opts: S3ClientConfig = {
        apiVersion: 'latest',
      }
      if (env.get('S3_AWS_REGION', true)) {
        s3Opts.region = env.get('S3_AWS_REGION', true)
      }
      if (env.get('S3_ENDPOINT', true)) {
        s3Opts.endpoint = env.get('S3_ENDPOINT', true)
      }
      const s3Client = new S3Client(s3Opts)
      container.bind<S3Client>(TYPES.Files_S3).toConstantValue(s3Client)
      container.bind<FileDownloaderInterface>(TYPES.Files_FileDownloader).to(S3FileDownloader)
      container.bind<FileUploaderInterface>(TYPES.Files_FileUploader).to(S3FileUploader)
      container.bind<FileRemoverInterface>(TYPES.Files_FileRemover).to(S3FileRemover)
    } else {
      container.bind<FileDownloaderInterface>(TYPES.Files_FileDownloader).to(FSFileDownloader)
      container
        .bind<FileUploaderInterface>(TYPES.Files_FileUploader)
        .toConstantValue(
          new FSFileUploader(container.get(TYPES.Files_FILE_UPLOAD_PATH), container.get(TYPES.Files_Logger)),
        )
      container.bind<FileRemoverInterface>(TYPES.Files_FileRemover).to(FSFileRemover)
    }

    // use cases
    container.bind<UploadFileChunk>(TYPES.Files_UploadFileChunk).to(UploadFileChunk)
    container.bind<StreamDownloadFile>(TYPES.Files_StreamDownloadFile).to(StreamDownloadFile)
    container.bind<CreateUploadSession>(TYPES.Files_CreateUploadSession).to(CreateUploadSession)
    container.bind<FinishUploadSession>(TYPES.Files_FinishUploadSession).to(FinishUploadSession)
    container.bind<GetFileMetadata>(TYPES.Files_GetFileMetadata).to(GetFileMetadata)
    container.bind<RemoveFile>(TYPES.Files_RemoveFile).to(RemoveFile)
    container.bind<MarkFilesToBeRemoved>(TYPES.Files_MarkFilesToBeRemoved).to(MarkFilesToBeRemoved)

    // middleware
    container.bind<ValetTokenAuthMiddleware>(TYPES.Files_ValetTokenAuthMiddleware).to(ValetTokenAuthMiddleware)

    // services
    container
      .bind<TokenDecoderInterface<ValetTokenData>>(TYPES.Files_ValetTokenDecoder)
      .toConstantValue(new TokenDecoder<ValetTokenData>(container.get(TYPES.Files_VALET_TOKEN_SECRET)))
    container.bind<DomainEventFactoryInterface>(TYPES.Files_DomainEventFactory).to(DomainEventFactory)

    // Handlers
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.Files_AccountDeletionRequestedEventHandler)
      .to(AccountDeletionRequestedEventHandler)
    container
      .bind<SharedSubscriptionInvitationCanceledEventHandler>(
        TYPES.Files_SharedSubscriptionInvitationCanceledEventHandler,
      )
      .to(SharedSubscriptionInvitationCanceledEventHandler)

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.Files_AccountDeletionRequestedEventHandler)],
      [
        'SHARED_SUBSCRIPTION_INVITATION_CANCELED',
        container.get(TYPES.Files_SharedSubscriptionInvitationCanceledEventHandler),
      ],
    ])

    if (isConfiguredForHomeServer) {
      const directCallEventMessageHandler = new DirectCallEventMessageHandler(
        eventHandlers,
        container.get(TYPES.Files_Logger),
      )
      directCallDomainEventPublisher.register(directCallEventMessageHandler)
      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.Files_DomainEventMessageHandler)
        .toConstantValue(directCallEventMessageHandler)
    } else {
      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.Files_DomainEventMessageHandler)
        .toConstantValue(
          env.get('NEW_RELIC_ENABLED', true) === 'true'
            ? new SQSNewRelicEventMessageHandler(eventHandlers, container.get(TYPES.Files_Logger))
            : new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Files_Logger)),
        )
      container
        .bind<DomainEventSubscriberFactoryInterface>(TYPES.Files_DomainEventSubscriberFactory)
        .toConstantValue(
          new SQSDomainEventSubscriberFactory(
            container.get(TYPES.Files_SQS),
            container.get(TYPES.Files_SQS_QUEUE_URL),
            container.get(TYPES.Files_DomainEventMessageHandler),
          ),
        )
    }

    return container
  }

  createLogger({ env }: { env: Env }): winston.Logger {
    return winston.createLogger({
      level: env.get('LOG_LEVEL') || 'info',
      format: winston.format.combine(winston.format.splat(), winston.format.json()),
      transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' })],
      defaultMeta: { service: 'files' },
    })
  }
}
