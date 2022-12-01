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
import { TokenDecoderInterface, CrossServiceTokenData, TokenDecoder } from '@standardnotes/security'
import {
  RedisDomainEventSubscriberFactory,
  RedisEventMessageHandler,
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'

import { Env } from './Env'
import TYPES from './Types'
import { AppDataSource } from './DataSource'
import { InversifyExpressApiGatewayAuthMiddleware } from '../Infra/InversifyExpress/InversifyExpressApiGatewayAuthMiddleware'
import { MuteAllEmails } from '../Domain/UseCase/MuteAllEmails/MuteAllEmails'
import { Repository } from 'typeorm'
import { TypeORMSetting } from '../Infra/TypeORM/TypeORMSetting'
import { SettingRepositoryInterface } from '../Domain/Setting/SettingRepositoryInterface'
import { MySQLSettingRepository } from '../Infra/MySQL/MySQLSettingRepository'
import { SettingsController } from '../Controller/SettingsController'
import { SettingPersistenceMapper } from '../Mapping/SettingPersistenceMapper'
import { Setting } from '../Domain/Setting/Setting'

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

    // Map
    container
      .bind<MapperInterface<Setting, TypeORMSetting>>(TYPES.SettingPersistenceMapper)
      .toConstantValue(new SettingPersistenceMapper())

    // ORM
    container
      .bind<Repository<TypeORMSetting>>(TYPES.ORMSettingRepository)
      .toConstantValue(AppDataSource.getRepository(TypeORMSetting))

    // env vars
    container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL', true))
    container.bind(TYPES.REDIS_EVENTS_CHANNEL).toConstantValue(env.get('REDIS_EVENTS_CHANNEL'))
    container.bind(TYPES.AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container.bind(TYPES.NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))

    // Repositories
    container
      .bind<SettingRepositoryInterface>(TYPES.SettingRepository)
      .toConstantValue(
        new MySQLSettingRepository(
          container.get(TYPES.ORMSettingRepository),
          container.get(TYPES.SettingPersistenceMapper),
        ),
      )

    // use cases
    container
      .bind<MuteAllEmails>(TYPES.MuteAllEmails)
      .toConstantValue(new MuteAllEmails(container.get(TYPES.SettingRepository)))

    // Controller
    container
      .bind<SettingsController>(TYPES.SettingsController)
      .toConstantValue(new SettingsController(container.get(TYPES.MuteAllEmails)))

    // Handlers

    // Services
    container
      .bind<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.CrossServiceTokenDecoder)
      .toConstantValue(new TokenDecoder<CrossServiceTokenData>(container.get(TYPES.AUTH_JWT_SECRET)))

    // Middleware
    container
      .bind<InversifyExpressApiGatewayAuthMiddleware>(TYPES.ApiGatewayAuthMiddleware)
      .to(InversifyExpressApiGatewayAuthMiddleware)

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([])

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
