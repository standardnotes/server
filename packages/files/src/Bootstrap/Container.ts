import * as winston from 'winston'
import Redis from 'ioredis'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3'
import { Container } from 'inversify'

import { Env } from './Env'
import TYPES from './Types'
import { UploadFileChunk } from '../Domain/UseCase/UploadFileChunk/UploadFileChunk'
import { ValetTokenAuthMiddleware } from '../Controller/ValetTokenAuthMiddleware'
import { TokenDecoder, TokenDecoderInterface, ValetTokenData } from '@standardnotes/security'
import { Timer, TimerInterface } from '@standardnotes/time'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { DomainEventFactory } from '../Domain/Event/DomainEventFactory'
import {
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
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import { MarkFilesToBeRemoved } from '../Domain/UseCase/MarkFilesToBeRemoved/MarkFilesToBeRemoved'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { SharedSubscriptionInvitationCanceledEventHandler } from '../Domain/Handler/SharedSubscriptionInvitationCanceledEventHandler'
import { InMemoryUploadRepository } from '../Infra/InMemory/InMemoryUploadRepository'
import { VaultValetTokenAuthMiddleware } from '../Controller/VaultValetTokenAuthMiddleware'
import { FileMoverInterface } from '../Domain/Services/FileMoverInterface'
import { S3FileMover } from '../Infra/S3/S3FileMover'
import { FSFileMover } from '../Infra/FS/FSFileMover'
import { MoveFile } from '../Domain/UseCase/MoveFile/MoveFile'

export class ContainerConfigLoader {
  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

    const isConfiguredForHomeServer = env.get('CACHE_TYPE') === 'memory'

    const logger = this.createLogger({ env })
    container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

    // env vars
    container.bind(TYPES.S3_BUCKET_NAME).toConstantValue(env.get('S3_BUCKET_NAME', true))
    container.bind(TYPES.S3_AWS_REGION).toConstantValue(env.get('S3_AWS_REGION', true))
    container.bind(TYPES.VALET_TOKEN_SECRET).toConstantValue(env.get('VALET_TOKEN_SECRET'))
    container.bind(TYPES.SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN'))
    container.bind(TYPES.SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
    container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
    container.bind(TYPES.MAX_CHUNK_BYTES).toConstantValue(+env.get('MAX_CHUNK_BYTES'))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))
    container
      .bind(TYPES.FILE_UPLOAD_PATH)
      .toConstantValue(env.get('FILE_UPLOAD_PATH', true) ?? `${__dirname}/../../uploads`)

    const redisUrl = container.get(TYPES.REDIS_URL) as string
    const isRedisInClusterMode = redisUrl.indexOf(',') > 0
    let redis
    if (isRedisInClusterMode) {
      redis = new Redis.Cluster(redisUrl.split(','))
    } else {
      redis = new Redis(redisUrl)
    }

    container.bind(TYPES.Redis).toConstantValue(redis)

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
      container.bind<S3Client>(TYPES.S3).toConstantValue(s3Client)
      container.bind<FileDownloaderInterface>(TYPES.FileDownloader).to(S3FileDownloader)
      container.bind<FileUploaderInterface>(TYPES.FileUploader).to(S3FileUploader)
      container.bind<FileRemoverInterface>(TYPES.FileRemover).to(S3FileRemover)
      container.bind<FileMoverInterface>(TYPES.FileMover).to(S3FileMover)
    } else {
      container.bind<FileDownloaderInterface>(TYPES.FileDownloader).to(FSFileDownloader)
      container
        .bind<FileUploaderInterface>(TYPES.FileUploader)
        .toConstantValue(new FSFileUploader(container.get(TYPES.FILE_UPLOAD_PATH), container.get(TYPES.Logger)))
      container.bind<FileRemoverInterface>(TYPES.FileRemover).to(FSFileRemover)
      container.bind<FileMoverInterface>(TYPES.FileMover).to(FSFileMover)
    }

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
      container.bind<SNSClient>(TYPES.SNS).toConstantValue(new SNSClient(snsConfig))
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
      container.bind<SQSClient>(TYPES.SQS).toConstantValue(new SQSClient(sqsConfig))
    }

    // use cases
    container.bind<UploadFileChunk>(TYPES.UploadFileChunk).to(UploadFileChunk)
    container.bind<StreamDownloadFile>(TYPES.StreamDownloadFile).to(StreamDownloadFile)
    container.bind<CreateUploadSession>(TYPES.CreateUploadSession).to(CreateUploadSession)
    container.bind<FinishUploadSession>(TYPES.FinishUploadSession).to(FinishUploadSession)
    container.bind<GetFileMetadata>(TYPES.GetFileMetadata).to(GetFileMetadata)
    container.bind<RemoveFile>(TYPES.RemoveFile).to(RemoveFile)
    container.bind<MoveFile>(TYPES.MoveFile).to(MoveFile)
    container.bind<MarkFilesToBeRemoved>(TYPES.MarkFilesToBeRemoved).to(MarkFilesToBeRemoved)

    // middleware
    container.bind<ValetTokenAuthMiddleware>(TYPES.ValetTokenAuthMiddleware).to(ValetTokenAuthMiddleware)
    container.bind<VaultValetTokenAuthMiddleware>(TYPES.VaultValetTokenAuthMiddleware).to(VaultValetTokenAuthMiddleware)

    // services
    container
      .bind<TokenDecoderInterface<ValetTokenData>>(TYPES.ValetTokenDecoder)
      .toConstantValue(new TokenDecoder<ValetTokenData>(container.get(TYPES.VALET_TOKEN_SECRET)))
    container.bind<TimerInterface>(TYPES.Timer).toConstantValue(new Timer())
    container.bind<DomainEventFactoryInterface>(TYPES.DomainEventFactory).to(DomainEventFactory)

    // repositories
    if (isConfiguredForHomeServer) {
      container
        .bind<UploadRepositoryInterface>(TYPES.UploadRepository)
        .toConstantValue(new InMemoryUploadRepository(container.get(TYPES.Timer)))
    } else {
      container.bind<UploadRepositoryInterface>(TYPES.UploadRepository).to(RedisUploadRepository)
    }

    container
      .bind<SNSDomainEventPublisher>(TYPES.DomainEventPublisher)
      .toConstantValue(new SNSDomainEventPublisher(container.get(TYPES.SNS), container.get(TYPES.SNS_TOPIC_ARN)))

    // Handlers
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.AccountDeletionRequestedEventHandler)
      .to(AccountDeletionRequestedEventHandler)
    container
      .bind<SharedSubscriptionInvitationCanceledEventHandler>(TYPES.SharedSubscriptionInvitationCanceledEventHandler)
      .to(SharedSubscriptionInvitationCanceledEventHandler)

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.AccountDeletionRequestedEventHandler)],
      [
        'SHARED_SUBSCRIPTION_INVITATION_CANCELED',
        container.get(TYPES.SharedSubscriptionInvitationCanceledEventHandler),
      ],
    ])

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

    return container
  }

  createLogger({ env }: { env: Env }): winston.Logger {
    return winston.createLogger({
      level: env.get('LOG_LEVEL') || 'info',
      format: winston.format.combine(winston.format.splat(), winston.format.json()),
      transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' })],
    })
  }
}
