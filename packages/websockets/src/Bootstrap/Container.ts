import * as winston from 'winston'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios')
import { AxiosInstance } from 'axios'
import Redis from 'ioredis'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { Container } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import { Env } from './Env'
import TYPES from './Types'
import { WebSocketsConnectionRepositoryInterface } from '../Domain/WebSockets/WebSocketsConnectionRepositoryInterface'
import { RedisWebSocketsConnectionRepository } from '../Infra/Redis/RedisWebSocketsConnectionRepository'
import { AddWebSocketsConnection } from '../Domain/UseCase/AddWebSocketsConnection/AddWebSocketsConnection'
import { RemoveWebSocketsConnection } from '../Domain/UseCase/RemoveWebSocketsConnection/RemoveWebSocketsConnection'
import { WebSocketsClientMessenger } from '../Infra/WebSockets/WebSocketsClientMessenger'
import {
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { ApiGatewayAuthMiddleware } from '../Controller/ApiGatewayAuthMiddleware'

import {
  CrossServiceTokenData,
  TokenDecoder,
  TokenDecoderInterface,
  TokenEncoder,
  TokenEncoderInterface,
  WebSocketConnectionTokenData,
} from '@standardnotes/security'
import { CreateWebSocketConnectionToken } from '../Domain/UseCase/CreateWebSocketConnectionToken/CreateWebSocketConnectionToken'
import { WebSocketsController } from '../Controller/WebSocketsController'
import { WebSocketServerInterface } from '@standardnotes/api'
import { ClientMessengerInterface } from '../Client/ClientMessengerInterface'
import { WebSocketMessageRequestedEventHandler } from '../Domain/Handler/WebSocketMessageRequestedEventHandler'

export class ContainerConfigLoader {
  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

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
    if (env.get('NEW_RELIC_ENABLED', true) === 'true') {
      await import('newrelic')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const newrelicFormatter = require('@newrelic/winston-enricher')
      const newrelicWinstonFormatter = newrelicFormatter(winston)
      winstonFormatters.push(newrelicWinstonFormatter())
    }

    const logger = winston.createLogger({
      level: env.get('LOG_LEVEL') || 'info',
      format: winston.format.combine(...winstonFormatters),
      transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' })],
    })
    container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

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

    // Controller
    container.bind<WebSocketServerInterface>(TYPES.WebSocketsController).to(WebSocketsController)

    // Repositories
    container
      .bind<WebSocketsConnectionRepositoryInterface>(TYPES.WebSocketsConnectionRepository)
      .to(RedisWebSocketsConnectionRepository)

    // Middleware
    container.bind<ApiGatewayAuthMiddleware>(TYPES.ApiGatewayAuthMiddleware).to(ApiGatewayAuthMiddleware)

    // env vars
    container.bind(TYPES.AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container
      .bind(TYPES.WEB_SOCKET_CONNECTION_TOKEN_SECRET)
      .toConstantValue(env.get('WEB_SOCKET_CONNECTION_TOKEN_SECRET', true))
    container
      .bind(TYPES.WEB_SOCKET_CONNECTION_TOKEN_TTL)
      .toConstantValue(+env.get('WEB_SOCKET_CONNECTION_TOKEN_TTL', true))
    container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))
    container.bind(TYPES.NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.WEBSOCKETS_API_URL).toConstantValue(env.get('WEBSOCKETS_API_URL', true))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))

    // use cases
    container.bind<AddWebSocketsConnection>(TYPES.AddWebSocketsConnection).to(AddWebSocketsConnection)
    container.bind<RemoveWebSocketsConnection>(TYPES.RemoveWebSocketsConnection).to(RemoveWebSocketsConnection)
    container
      .bind<CreateWebSocketConnectionToken>(TYPES.CreateWebSocketConnectionToken)
      .to(CreateWebSocketConnectionToken)

    // Handlers
    container
      .bind<WebSocketMessageRequestedEventHandler>(TYPES.WebSocketMessageRequestedEventHandler)
      .to(WebSocketMessageRequestedEventHandler)

    // Services
    container.bind<AxiosInstance>(TYPES.HTTPClient).toConstantValue(axios.create())
    container
      .bind<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.CrossServiceTokenDecoder)
      .toConstantValue(new TokenDecoder<CrossServiceTokenData>(container.get(TYPES.AUTH_JWT_SECRET)))
    container
      .bind<TokenEncoderInterface<WebSocketConnectionTokenData>>(TYPES.WebSocketConnectionTokenEncoder)
      .toConstantValue(
        new TokenEncoder<WebSocketConnectionTokenData>(container.get(TYPES.WEB_SOCKET_CONNECTION_TOKEN_SECRET)),
      )
    container.bind<ClientMessengerInterface>(TYPES.WebSocketsClientMessenger).to(WebSocketsClientMessenger)

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['WEB_SOCKET_MESSAGE_REQUESTED', container.get(TYPES.WebSocketMessageRequestedEventHandler)],
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
}
