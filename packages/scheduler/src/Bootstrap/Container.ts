import * as winston from 'winston'
import Redis from 'ioredis'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { Container } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'

import { Env } from './Env'
import TYPES from './Types'
import { AppDataSource } from './DataSource'
import { DomainEventFactory } from '../Domain/Event/DomainEventFactory'
import {
  SNSDomainEventPublisher,
  SQSDomainEventSubscriberFactory,
  SQSOpenTelemetryEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { Timer, TimerInterface } from '@standardnotes/time'
import { PredicateRepositoryInterface } from '../Domain/Predicate/PredicateRepositoryInterface'
import { MySQLPredicateRepository } from '../Infra/MySQL/MySQLPredicateRepository'
import { JobRepositoryInterface } from '../Domain/Job/JobRepositoryInterface'
import { MySQLJobRepository } from '../Infra/MySQL/MySQLJobRepository'
import { Repository } from 'typeorm'
import { Predicate } from '../Domain/Predicate/Predicate'
import { Job } from '../Domain/Job/Job'
import { JobDoneInterpreterInterface } from '../Domain/Job/JobDoneInterpreterInterface'
import { JobDoneInterpreter } from '../Domain/Job/JobDoneInterpreter'
import { UpdatePredicateStatus } from '../Domain/UseCase/UpdatePredicateStatus/UpdatePredicateStatus'
import { PredicateVerifiedEventHandler } from '../Domain/Handler/PredicateVerifiedEventHandler'
import { VerifyPredicates } from '../Domain/UseCase/VerifyPredicates/VerifyPredicates'
import { UserRegisteredEventHandler } from '../Domain/Handler/UserRegisteredEventHandler'
import { SubscriptionCancelledEventHandler } from '../Domain/Handler/SubscriptionCancelledEventHandler'
import { ExitDiscountAppliedEventHandler } from '../Domain/Handler/ExitDiscountAppliedEventHandler'
import { ServiceIdentifier } from '@standardnotes/domain-core'

export class ContainerConfigLoader {
  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

    await AppDataSource.initialize()

    const redisUrl = env.get('REDIS_URL')
    const isRedisInClusterMode = redisUrl.indexOf(',') > 0
    let redis
    if (isRedisInClusterMode) {
      redis = new Redis.Cluster(redisUrl.split(','))
    } else {
      redis = new Redis(redisUrl)
    }

    container.bind(TYPES.Redis).toConstantValue(redis)

    const winstonFormatters = [winston.format.splat(), winston.format.json()]

    const logger = winston.createLogger({
      level: env.get('LOG_LEVEL', true) || 'info',
      format: winston.format.combine(...winstonFormatters),
      transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL', true) || 'info' })],
    })
    container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

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

    // env vars
    container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
    container.bind(TYPES.SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN'))
    container.bind(TYPES.SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))

    // Repositories
    container.bind<PredicateRepositoryInterface>(TYPES.PredicateRepository).to(MySQLPredicateRepository)
    container.bind<JobRepositoryInterface>(TYPES.JobRepository).to(MySQLJobRepository)

    // ORM
    container
      .bind<Repository<Predicate>>(TYPES.ORMPredicateRepository)
      .toConstantValue(AppDataSource.getRepository(Predicate))
    container.bind<Repository<Job>>(TYPES.ORMJobRepository).toConstantValue(AppDataSource.getRepository(Job))

    // Use Case
    container.bind<UpdatePredicateStatus>(TYPES.UpdatePredicateStatus).to(UpdatePredicateStatus)
    container.bind<VerifyPredicates>(TYPES.VerifyPredicates).to(VerifyPredicates)

    // Hanlders
    container.bind<PredicateVerifiedEventHandler>(TYPES.PredicateVerifiedEventHandler).to(PredicateVerifiedEventHandler)
    container.bind<UserRegisteredEventHandler>(TYPES.UserRegisteredEventHandler).to(UserRegisteredEventHandler)
    container
      .bind<SubscriptionCancelledEventHandler>(TYPES.SubscriptionCancelledEventHandler)
      .to(SubscriptionCancelledEventHandler)
    container
      .bind<ExitDiscountAppliedEventHandler>(TYPES.ExitDiscountAppliedEventHandler)
      .to(ExitDiscountAppliedEventHandler)

    // Services
    container.bind<DomainEventFactory>(TYPES.DomainEventFactory).to(DomainEventFactory)
    container.bind<TimerInterface>(TYPES.Timer).toConstantValue(new Timer())
    container.bind<JobDoneInterpreterInterface>(TYPES.JobDoneInterpreter).to(JobDoneInterpreter)

    container
      .bind<SNSDomainEventPublisher>(TYPES.DomainEventPublisher)
      .toConstantValue(new SNSDomainEventPublisher(container.get(TYPES.SNS), container.get(TYPES.SNS_TOPIC_ARN)))

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['PREDICATE_VERIFIED', container.get(TYPES.PredicateVerifiedEventHandler)],
      ['USER_REGISTERED', container.get(TYPES.UserRegisteredEventHandler)],
      ['SUBSCRIPTION_CANCELLED', container.get(TYPES.SubscriptionCancelledEventHandler)],
      ['EXIT_DISCOUNT_APPLIED', container.get(TYPES.ExitDiscountAppliedEventHandler)],
    ])

    container
      .bind<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler)
      .toConstantValue(
        new SQSOpenTelemetryEventMessageHandler(
          ServiceIdentifier.NAMES.SchedulerWorker,
          eventHandlers,
          container.get(TYPES.Logger),
        ),
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
}
