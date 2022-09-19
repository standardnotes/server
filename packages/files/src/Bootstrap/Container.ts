import * as winston from 'winston'
import Redis from 'ioredis'
import * as AWS from 'aws-sdk'
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
  RedisDomainEventPublisher,
  RedisDomainEventSubscriberFactory,
  RedisEventMessageHandler,
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
import { Uuid, UuidValidator, ValidatorInterface } from '@standardnotes/common'

export class ContainerConfigLoader {
  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

    const logger = this.createLogger({ env })
    container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

    // env vars
    container.bind(TYPES.S3_BUCKET_NAME).toConstantValue(env.get('S3_BUCKET_NAME', true))
    container.bind(TYPES.S3_AWS_REGION).toConstantValue(env.get('S3_AWS_REGION', true))
    container.bind(TYPES.VALET_TOKEN_SECRET).toConstantValue(env.get('VALET_TOKEN_SECRET'))
    container.bind(TYPES.SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN', true))
    container.bind(TYPES.SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
    container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
    container.bind(TYPES.REDIS_EVENTS_CHANNEL).toConstantValue(env.get('REDIS_EVENTS_CHANNEL'))
    container.bind(TYPES.MAX_CHUNK_BYTES).toConstantValue(+env.get('MAX_CHUNK_BYTES'))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL', true))
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

    if (env.get('AWS_ACCESS_KEY_ID', true)) {
      AWS.config.credentials = new AWS.EnvironmentCredentials('AWS')
    }

    if (env.get('S3_AWS_REGION', true) || env.get('S3_ENDPOINT', true)) {
      const s3Opts: AWS.S3.Types.ClientConfiguration = {
        apiVersion: 'latest',
      }
      if (env.get('S3_AWS_REGION', true)) {
        s3Opts.region = env.get('S3_AWS_REGION', true)
      }
      if (env.get('S3_ENDPOINT', true)) {
        s3Opts.endpoint = new AWS.Endpoint(env.get('S3_ENDPOINT', true))
      }
      const s3Client = new AWS.S3(s3Opts)
      container.bind<AWS.S3>(TYPES.S3).toConstantValue(s3Client)
      container.bind<FileDownloaderInterface>(TYPES.FileDownloader).to(S3FileDownloader)
      container.bind<FileUploaderInterface>(TYPES.FileUploader).to(S3FileUploader)
      container.bind<FileRemoverInterface>(TYPES.FileRemover).to(S3FileRemover)
    } else {
      container.bind<FileDownloaderInterface>(TYPES.FileDownloader).to(FSFileDownloader)
      container
        .bind<FileUploaderInterface>(TYPES.FileUploader)
        .toConstantValue(new FSFileUploader(container.get(TYPES.FILE_UPLOAD_PATH), container.get(TYPES.Logger)))
      container.bind<FileRemoverInterface>(TYPES.FileRemover).to(FSFileRemover)
    }
    container.bind<ValidatorInterface<Uuid>>(TYPES.UuidValidator).toConstantValue(new UuidValidator())

    if (env.get('SNS_AWS_REGION', true)) {
      container.bind<AWS.SNS>(TYPES.SNS).toConstantValue(
        new AWS.SNS({
          apiVersion: 'latest',
          region: env.get('SNS_AWS_REGION', true),
        }),
      )
    }

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

    // use cases
    container.bind<UploadFileChunk>(TYPES.UploadFileChunk).to(UploadFileChunk)
    container.bind<StreamDownloadFile>(TYPES.StreamDownloadFile).to(StreamDownloadFile)
    container.bind<CreateUploadSession>(TYPES.CreateUploadSession).to(CreateUploadSession)
    container.bind<FinishUploadSession>(TYPES.FinishUploadSession).to(FinishUploadSession)
    container.bind<GetFileMetadata>(TYPES.GetFileMetadata).to(GetFileMetadata)
    container.bind<RemoveFile>(TYPES.RemoveFile).to(RemoveFile)
    container.bind<MarkFilesToBeRemoved>(TYPES.MarkFilesToBeRemoved).to(MarkFilesToBeRemoved)

    // middleware
    container.bind<ValetTokenAuthMiddleware>(TYPES.ValetTokenAuthMiddleware).to(ValetTokenAuthMiddleware)

    // services
    container
      .bind<TokenDecoderInterface<ValetTokenData>>(TYPES.ValetTokenDecoder)
      .toConstantValue(new TokenDecoder<ValetTokenData>(container.get(TYPES.VALET_TOKEN_SECRET)))
    container.bind<TimerInterface>(TYPES.Timer).toConstantValue(new Timer())
    container.bind<DomainEventFactoryInterface>(TYPES.DomainEventFactory).to(DomainEventFactory)

    // repositories
    container.bind<UploadRepositoryInterface>(TYPES.UploadRepository).to(RedisUploadRepository)

    if (env.get('SNS_TOPIC_ARN', true)) {
      container
        .bind<SNSDomainEventPublisher>(TYPES.DomainEventPublisher)
        .toConstantValue(new SNSDomainEventPublisher(container.get(TYPES.SNS), container.get(TYPES.SNS_TOPIC_ARN)))
    } else {
      container
        .bind<RedisDomainEventPublisher>(TYPES.DomainEventPublisher)
        .toConstantValue(
          new RedisDomainEventPublisher(container.get(TYPES.Redis), container.get(TYPES.REDIS_EVENTS_CHANNEL)),
        )
    }

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

  createLogger({ env }: { env: Env }): winston.Logger {
    return winston.createLogger({
      level: env.get('LOG_LEVEL') || 'info',
      format: winston.format.combine(winston.format.splat(), winston.format.json()),
      transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' })],
    })
  }
}
