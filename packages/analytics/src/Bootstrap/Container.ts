import * as winston from 'winston'
import Redis from 'ioredis'
import * as AWS from 'aws-sdk'
import { Container } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import { MapperInterface } from '@standardnotes/domain-core'

import { Env } from './Env'
import TYPES from './Types'
import { AppDataSource } from './DataSource'
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
import { Timer, TimerInterface } from '@standardnotes/time'
import { PeriodKeyGeneratorInterface } from '../Domain/Time/PeriodKeyGeneratorInterface'
import { PeriodKeyGenerator } from '../Domain/Time/PeriodKeyGenerator'
import { AnalyticsStoreInterface } from '../Domain/Analytics/AnalyticsStoreInterface'
import { RedisAnalyticsStore } from '../Infra/Redis/RedisAnalyticsStore'
import { StatisticsStoreInterface } from '../Domain/Statistics/StatisticsStoreInterface'
import { RedisStatisticsStore } from '../Infra/Redis/RedisStatisticsStore'
import { AnalyticsEntityRepositoryInterface } from '../Domain/Entity/AnalyticsEntityRepositoryInterface'
import { MySQLAnalyticsEntityRepository } from '../Infra/MySQL/MySQLAnalyticsEntityRepository'
import { Repository } from 'typeorm'
import { AnalyticsEntity } from '../Domain/Entity/AnalyticsEntity'
import { GetUserAnalyticsId } from '../Domain/UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { UserRegisteredEventHandler } from '../Domain/Handler/UserRegisteredEventHandler'
import { AccountDeletionRequestedEventHandler } from '../Domain/Handler/AccountDeletionRequestedEventHandler'
import { PaymentFailedEventHandler } from '../Domain/Handler/PaymentFailedEventHandler'
import { PaymentSuccessEventHandler } from '../Domain/Handler/PaymentSuccessEventHandler'
import { SubscriptionCancelledEventHandler } from '../Domain/Handler/SubscriptionCancelledEventHandler'
import { SubscriptionRenewedEventHandler } from '../Domain/Handler/SubscriptionRenewedEventHandler'
import { SubscriptionRefundedEventHandler } from '../Domain/Handler/SubscriptionRefundedEventHandler'
import { SubscriptionPurchasedEventHandler } from '../Domain/Handler/SubscriptionPurchasedEventHandler'
import { SubscriptionExpiredEventHandler } from '../Domain/Handler/SubscriptionExpiredEventHandler'
import { SubscriptionReactivatedEventHandler } from '../Domain/Handler/SubscriptionReactivatedEventHandler'
import { RefundProcessedEventHandler } from '../Domain/Handler/RefundProcessedEventHandler'
import { RevenueModificationRepositoryInterface } from '../Domain/Revenue/RevenueModificationRepositoryInterface'
import { MySQLRevenueModificationRepository } from '../Infra/MySQL/MySQLRevenueModificationRepository'
import { TypeORMRevenueModification } from '../Infra/TypeORM/TypeORMRevenueModification'
import { RevenueModification } from '../Domain/Revenue/RevenueModification'
import { RevenueModificationMap } from '../Domain/Map/RevenueModificationMap'
import { SaveRevenueModification } from '../Domain/UseCase/SaveRevenueModification/SaveRevenueModification'
import { CalculateMonthlyRecurringRevenue } from '../Domain/UseCase/CalculateMonthlyRecurringRevenue/CalculateMonthlyRecurringRevenue'
import { PersistStatistic } from '../Domain/UseCase/PersistStatistic/PersistStatistic'
import { StatisticMeasureRepositoryInterface } from '../Domain/Statistics/StatisticMeasureRepositoryInterface'
import { StatisticPersistenceRequestedEventHandler } from '../Domain/Handler/StatisticPersistenceRequestedEventHandler'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicFormatter = require('@newrelic/winston-enricher')

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
    container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

    if (env.get('SNS_TOPIC_ARN', true)) {
      const snsConfig: AWS.SNS.Types.ClientConfiguration = {
        apiVersion: 'latest',
        region: env.get('SNS_AWS_REGION', true),
      }
      if (env.get('SNS_ENDPOINT', true)) {
        snsConfig.endpoint = env.get('SNS_ENDPOINT', true)
      }
      if (env.get('SNS_DISABLE_SSL', true) === 'true') {
        snsConfig.sslEnabled = false
      }
      if (env.get('SNS_ACCESS_KEY_ID', true) && env.get('SNS_SECRET_ACCESS_KEY', true)) {
        snsConfig.credentials = {
          accessKeyId: env.get('SNS_ACCESS_KEY_ID', true),
          secretAccessKey: env.get('SNS_SECRET_ACCESS_KEY', true),
        }
      }
      container.bind<AWS.SNS>(TYPES.SNS).toConstantValue(new AWS.SNS(snsConfig))
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

    // env vars
    container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
    container.bind(TYPES.SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN', true))
    container.bind(TYPES.SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL', true))
    container.bind(TYPES.REDIS_EVENTS_CHANNEL).toConstantValue(env.get('REDIS_EVENTS_CHANNEL'))
    container.bind(TYPES.NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.ADMIN_EMAILS).toConstantValue(env.get('ADMIN_EMAILS').split(','))

    // Services
    container.bind<DomainEventFactory>(TYPES.DomainEventFactory).to(DomainEventFactory)
    container.bind<PeriodKeyGeneratorInterface>(TYPES.PeriodKeyGenerator).toConstantValue(new PeriodKeyGenerator())
    container
      .bind<AnalyticsStoreInterface>(TYPES.AnalyticsStore)
      .toConstantValue(new RedisAnalyticsStore(container.get(TYPES.PeriodKeyGenerator), container.get(TYPES.Redis)))
    container
      .bind<StatisticsStoreInterface>(TYPES.StatisticsStore)
      .toConstantValue(new RedisStatisticsStore(container.get(TYPES.PeriodKeyGenerator), container.get(TYPES.Redis)))
    container.bind<TimerInterface>(TYPES.Timer).toConstantValue(new Timer())

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

    // Repositories
    container
      .bind<AnalyticsEntityRepositoryInterface>(TYPES.AnalyticsEntityRepository)
      .to(MySQLAnalyticsEntityRepository)
    container
      .bind<RevenueModificationRepositoryInterface>(TYPES.RevenueModificationRepository)
      .to(MySQLRevenueModificationRepository)
    container
      .bind<StatisticMeasureRepositoryInterface>(TYPES.StatisticMeasureRepository)
      .toConstantValue(new RedisStatisticsStore(container.get(TYPES.PeriodKeyGenerator), container.get(TYPES.Redis)))

    // ORM
    container
      .bind<Repository<AnalyticsEntity>>(TYPES.ORMAnalyticsEntityRepository)
      .toConstantValue(AppDataSource.getRepository(AnalyticsEntity))
    container
      .bind<Repository<TypeORMRevenueModification>>(TYPES.ORMRevenueModificationRepository)
      .toConstantValue(AppDataSource.getRepository(TypeORMRevenueModification))

    // Use Case
    container.bind<GetUserAnalyticsId>(TYPES.GetUserAnalyticsId).to(GetUserAnalyticsId)
    container.bind<SaveRevenueModification>(TYPES.SaveRevenueModification).to(SaveRevenueModification)
    container
      .bind<CalculateMonthlyRecurringRevenue>(TYPES.CalculateMonthlyRecurringRevenue)
      .to(CalculateMonthlyRecurringRevenue)
    container
      .bind<PersistStatistic>(TYPES.PersistStatistic)
      .toConstantValue(new PersistStatistic(container.get(TYPES.StatisticMeasureRepository)))

    // Hanlders
    container.bind<UserRegisteredEventHandler>(TYPES.UserRegisteredEventHandler).to(UserRegisteredEventHandler)
    container
      .bind<AccountDeletionRequestedEventHandler>(TYPES.AccountDeletionRequestedEventHandler)
      .to(AccountDeletionRequestedEventHandler)
    container.bind<PaymentFailedEventHandler>(TYPES.PaymentFailedEventHandler).to(PaymentFailedEventHandler)
    container.bind<PaymentSuccessEventHandler>(TYPES.PaymentSuccessEventHandler).to(PaymentSuccessEventHandler)
    container
      .bind<SubscriptionCancelledEventHandler>(TYPES.SubscriptionCancelledEventHandler)
      .to(SubscriptionCancelledEventHandler)
    container
      .bind<SubscriptionRenewedEventHandler>(TYPES.SubscriptionRenewedEventHandler)
      .to(SubscriptionRenewedEventHandler)
    container
      .bind<SubscriptionRefundedEventHandler>(TYPES.SubscriptionRefundedEventHandler)
      .to(SubscriptionRefundedEventHandler)
    container
      .bind<SubscriptionPurchasedEventHandler>(TYPES.SubscriptionPurchasedEventHandler)
      .to(SubscriptionPurchasedEventHandler)
    container
      .bind<SubscriptionExpiredEventHandler>(TYPES.SubscriptionExpiredEventHandler)
      .to(SubscriptionExpiredEventHandler)
    container
      .bind<SubscriptionReactivatedEventHandler>(TYPES.SubscriptionReactivatedEventHandler)
      .to(SubscriptionReactivatedEventHandler)
    container.bind<RefundProcessedEventHandler>(TYPES.RefundProcessedEventHandler).to(RefundProcessedEventHandler)
    container
      .bind<StatisticPersistenceRequestedEventHandler>(TYPES.StatisticPersistenceRequestedEventHandler)
      .toConstantValue(
        new StatisticPersistenceRequestedEventHandler(
          container.get(TYPES.PersistStatistic),
          container.get(TYPES.Logger),
        ),
      )

    // Maps
    container
      .bind<MapperInterface<RevenueModification, TypeORMRevenueModification>>(TYPES.RevenueModificationMap)
      .to(RevenueModificationMap)

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['USER_REGISTERED', container.get(TYPES.UserRegisteredEventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.AccountDeletionRequestedEventHandler)],
      ['PAYMENT_FAILED', container.get(TYPES.PaymentFailedEventHandler)],
      ['PAYMENT_SUCCESS', container.get(TYPES.PaymentSuccessEventHandler)],
      ['SUBSCRIPTION_CANCELLED', container.get(TYPES.SubscriptionCancelledEventHandler)],
      ['SUBSCRIPTION_RENEWED', container.get(TYPES.SubscriptionRenewedEventHandler)],
      ['SUBSCRIPTION_REFUNDED', container.get(TYPES.SubscriptionRefundedEventHandler)],
      ['SUBSCRIPTION_PURCHASED', container.get(TYPES.SubscriptionPurchasedEventHandler)],
      ['SUBSCRIPTION_EXPIRED', container.get(TYPES.SubscriptionExpiredEventHandler)],
      ['SUBSCRIPTION_REACTIVATED', container.get(TYPES.SubscriptionReactivatedEventHandler)],
      ['REFUND_PROCESSED', container.get(TYPES.RefundProcessedEventHandler)],
      ['STATISTIC_PERSISTENCE_REQUESTED', container.get(TYPES.StatisticPersistenceRequestedEventHandler)],
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
}
