import * as winston from 'winston'
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi'
import { Container } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberInterface,
} from '@standardnotes/domain-events'
import { TimerInterface, Timer } from '@standardnotes/time'
import { Env } from './Env'
import TYPES from './Types'
import { WebSocketsConnectionRepositoryInterface } from '../Domain/WebSockets/WebSocketsConnectionRepositoryInterface'
import { AddWebSocketsConnection } from '../Domain/UseCase/AddWebSocketsConnection/AddWebSocketsConnection'
import { RemoveWebSocketsConnection } from '../Domain/UseCase/RemoveWebSocketsConnection/RemoveWebSocketsConnection'
import { SQSDomainEventSubscriber, SQSEventMessageHandler } from '@standardnotes/domain-events-infra'
import { ApiGatewayAuthMiddleware } from '../Infra/InversifyExpressUtils/Middleware/ApiGatewayAuthMiddleware'
import {
  CrossServiceTokenData,
  TokenDecoder,
  TokenDecoderInterface,
  TokenEncoder,
  TokenEncoderInterface,
  WebSocketConnectionTokenData,
} from '@standardnotes/security'
import { CreateWebSocketConnectionToken } from '../Domain/UseCase/CreateWebSocketConnectionToken/CreateWebSocketConnectionToken'
import { WebSocketMessageRequestedEventHandler } from '../Domain/Handler/WebSocketMessageRequestedEventHandler'
import { SQLConnectionRepository } from '../Infra/TypeORM/SQLConnectionRepository'
import { Connection } from '../Domain/Connection/Connection'
import { SQLConnection } from '../Infra/TypeORM/SQLConnection'
import { MapperInterface } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'
import { ConnectionPersistenceMapper } from '../Mapping/SQL/ConnectionPersistenceMapper'
import { AppDataSource } from './DataSource'
import { SendMessageToClient } from '../Domain/UseCase/SendMessageToClient/SendMessageToClient'

export class ContainerConfigLoader {
  constructor(private mode: 'server' | 'worker' = 'server') {}

  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

    const winstonFormatters = [winston.format.splat(), winston.format.json()]

    const logger = winston.createLogger({
      level: env.get('LOG_LEVEL', true) || 'info',
      format: winston.format.combine(...winstonFormatters),
      transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL', true) || 'info' })],
    })
    container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

    const appDataSource = new AppDataSource({ env, runMigrations: this.mode === 'server' })
    await appDataSource.initialize()

    logger.debug('Database initialized')

    container.bind<TimerInterface>(TYPES.Timer).toConstantValue(new Timer())

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

    container.bind(TYPES.WEBSOCKETS_API_URL).toConstantValue(env.get('WEBSOCKETS_API_URL', true))

    container.bind<ApiGatewayManagementApiClient>(TYPES.WebSockets_ApiGatewayManagementApiClient).toConstantValue(
      new ApiGatewayManagementApiClient({
        endpoint: container.get(TYPES.WEBSOCKETS_API_URL),
        region: env.get('API_GATEWAY_AWS_REGION', true) ?? 'us-east-1',
      }),
    )
    // Mappers
    container
      .bind<MapperInterface<Connection, SQLConnection>>(TYPES.ConnectionPersistenceMapper)
      .toConstantValue(new ConnectionPersistenceMapper())

    // ORM
    container
      .bind<Repository<SQLConnection>>(TYPES.ORMConnectionRepository)
      .toConstantValue(appDataSource.getRepository(SQLConnection))

    // Repositories
    container
      .bind<WebSocketsConnectionRepositoryInterface>(TYPES.WebSocketsConnectionRepository)
      .toConstantValue(
        new SQLConnectionRepository(
          container.get<Repository<SQLConnection>>(TYPES.ORMConnectionRepository),
          container.get<MapperInterface<Connection, SQLConnection>>(TYPES.ConnectionPersistenceMapper),
          container.get<winston.Logger>(TYPES.Logger),
        ),
      )

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
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))

    // use cases
    container
      .bind<AddWebSocketsConnection>(TYPES.AddWebSocketsConnection)
      .toConstantValue(
        new AddWebSocketsConnection(
          container.get<WebSocketsConnectionRepositoryInterface>(TYPES.WebSocketsConnectionRepository),
          container.get<TimerInterface>(TYPES.Timer),
          container.get<winston.Logger>(TYPES.Logger),
        ),
      )
    container.bind<RemoveWebSocketsConnection>(TYPES.RemoveWebSocketsConnection).to(RemoveWebSocketsConnection)
    container
      .bind<CreateWebSocketConnectionToken>(TYPES.CreateWebSocketConnectionToken)
      .to(CreateWebSocketConnectionToken)
    container
      .bind<SendMessageToClient>(TYPES.SendMessageToClient)
      .toConstantValue(
        new SendMessageToClient(
          container.get<WebSocketsConnectionRepositoryInterface>(TYPES.WebSocketsConnectionRepository),
          container.get<ApiGatewayManagementApiClient>(TYPES.WebSockets_ApiGatewayManagementApiClient),
          container.get<winston.Logger>(TYPES.Logger),
        ),
      )

    // Handlers
    container
      .bind<WebSocketMessageRequestedEventHandler>(TYPES.WebSocketMessageRequestedEventHandler)
      .toConstantValue(
        new WebSocketMessageRequestedEventHandler(
          container.get<SendMessageToClient>(TYPES.SendMessageToClient),
          container.get<winston.Logger>(TYPES.Logger),
        ),
      )

    // Services
    container
      .bind<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.CrossServiceTokenDecoder)
      .toConstantValue(new TokenDecoder<CrossServiceTokenData>(container.get(TYPES.AUTH_JWT_SECRET)))
    container
      .bind<TokenEncoderInterface<WebSocketConnectionTokenData>>(TYPES.WebSocketConnectionTokenEncoder)
      .toConstantValue(
        new TokenEncoder<WebSocketConnectionTokenData>(container.get(TYPES.WEB_SOCKET_CONNECTION_TOKEN_SECRET)),
      )

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['WEB_SOCKET_MESSAGE_REQUESTED', container.get(TYPES.WebSocketMessageRequestedEventHandler)],
    ])

    container
      .bind<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler)
      .toConstantValue(new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Logger)))
    container
      .bind<DomainEventSubscriberInterface>(TYPES.DomainEventSubscriber)
      .toConstantValue(
        new SQSDomainEventSubscriber(
          container.get<SQSClient>(TYPES.SQS),
          container.get<string>(TYPES.SQS_QUEUE_URL),
          container.get<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler),
          container.get<winston.Logger>(TYPES.Logger),
        ),
      )

    return container
  }
}
