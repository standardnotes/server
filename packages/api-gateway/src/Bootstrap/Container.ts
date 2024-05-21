import * as winston from 'winston'
import * as AgentKeepAlive from 'agentkeepalive'
import * as grpc from '@grpc/grpc-js'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import axios, { AxiosInstance } from 'axios'
import Redis from 'ioredis'
import { Container } from 'inversify'
import { Timer, TimerInterface } from '@standardnotes/time'

import { Env } from './Env'
import { TYPES } from './Types'
import { ServiceProxyInterface } from '../Service/Proxy/ServiceProxyInterface'
import { HttpServiceProxy } from '../Service/Http/HttpServiceProxy'
import { SubscriptionTokenAuthMiddleware } from '../Controller/SubscriptionTokenAuthMiddleware'
import { CrossServiceTokenCacheInterface } from '../Service/Cache/CrossServiceTokenCacheInterface'
import { RedisCrossServiceTokenCache } from '../Infra/Redis/RedisCrossServiceTokenCache'
import { WebSocketAuthMiddleware } from '../Controller/WebSocketAuthMiddleware'
import { InMemoryCrossServiceTokenCache } from '../Infra/InMemory/InMemoryCrossServiceTokenCache'
import { DirectCallServiceProxy } from '../Service/DirectCall/DirectCallServiceProxy'
import { MapperInterface, ServiceContainerInterface } from '@standardnotes/domain-core'
import { EndpointResolverInterface } from '../Service/Resolver/EndpointResolverInterface'
import { EndpointResolver } from '../Service/Resolver/EndpointResolver'
import { RequiredCrossServiceTokenMiddleware } from '../Controller/RequiredCrossServiceTokenMiddleware'
import { OptionalCrossServiceTokenMiddleware } from '../Controller/OptionalCrossServiceTokenMiddleware'
import { Transform } from 'stream'
import { AuthClient, IAuthClient, ISyncingClient, SyncRequest, SyncResponse, SyncingClient } from '@standardnotes/grpc'
import { GRPCServiceProxy } from '../Service/gRPC/GRPCServiceProxy'
import { GRPCSyncingServerServiceProxy } from '../Service/gRPC/GRPCSyncingServerServiceProxy'
import { SyncResponseHttpRepresentation } from '../Mapping/Sync/Http/SyncResponseHttpRepresentation'
import { SyncRequestGRPCMapper } from '../Mapping/Sync/GRPC/SyncRequestGRPCMapper'
import { SyncResponseGRPCMapper } from '../Mapping/Sync/GRPC/SyncResponseGRPCMapper'
import { GRPCWebSocketAuthMiddleware } from '../Controller/GRPCWebSocketAuthMiddleware'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { SNSDomainEventPublisher } from '@standardnotes/domain-events-infra'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { DomainEventFactory } from '../Event/DomainEventFactory'

export class ContainerConfigLoader {
  async load(configuration?: {
    serviceContainer?: ServiceContainerInterface
    logger?: Transform
    environmentOverrides?: { [name: string]: string }
  }): Promise<Container> {
    const env: Env = new Env(configuration?.environmentOverrides)
    env.load()

    const container = new Container()

    const isConfiguredForHomeServer = env.get('MODE', true) === 'home-server'
    const isConfiguredForSelfHosting = env.get('MODE', true) === 'self-hosted'
    const isConfiguredForHomeServerOrSelfHosting = isConfiguredForHomeServer || isConfiguredForSelfHosting
    const isConfiguredForInMemoryCache = env.get('CACHE_TYPE', true) === 'memory'
    const isConfiguredForGRPCProxy = env.get('SERVICE_PROXY_TYPE', true) === 'grpc'

    container
      .bind<boolean>(TYPES.ApiGateway_IS_CONFIGURED_FOR_HOME_SERVER_OR_SELF_HOSTING)
      .toConstantValue(isConfiguredForHomeServerOrSelfHosting)

    if (!isConfiguredForHomeServerOrSelfHosting) {
      const snsConfig: SNSClientConfig = {
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
      const snsClient = new SNSClient(snsConfig)
      container.bind<SNSClient>(TYPES.ApiGateway_SNS).toConstantValue(snsClient)

      container.bind(TYPES.ApiGateway_SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN', true))

      container
        .bind<DomainEventPublisherInterface>(TYPES.ApiGateway_DomainEventPublisher)
        .toConstantValue(
          new SNSDomainEventPublisher(
            container.get(TYPES.ApiGateway_SNS),
            container.get(TYPES.ApiGateway_SNS_TOPIC_ARN),
          ),
        )
    }

    const winstonFormatters = [winston.format.splat(), winston.format.json()]

    let logger: winston.Logger
    if (configuration?.logger) {
      logger = configuration.logger as winston.Logger
    } else {
      logger = winston.createLogger({
        level: env.get('LOG_LEVEL', true) || 'info',
        format: winston.format.combine(...winstonFormatters),
        transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL', true) || 'info' })],
        defaultMeta: { service: 'api-gateway' },
      })
    }
    container.bind<winston.Logger>(TYPES.ApiGateway_Logger).toConstantValue(logger)

    if (!isConfiguredForInMemoryCache) {
      const redisUrl = env.get('REDIS_URL')
      const isRedisInClusterMode = redisUrl.indexOf(',') > 0
      let redis
      if (isRedisInClusterMode) {
        redis = new Redis.Cluster(redisUrl.split(','))
      } else {
        redis = new Redis(redisUrl)
      }
      container.bind(TYPES.ApiGateway_Redis).toConstantValue(redis)
    }

    const httpAgentKeepAliveTimeout = env.get('HTTP_AGENT_KEEP_ALIVE_TIMEOUT', true)
      ? +env.get('HTTP_AGENT_KEEP_ALIVE_TIMEOUT', true)
      : 4_000

    container.bind<AxiosInstance>(TYPES.ApiGateway_HTTPClient).toConstantValue(
      axios.create({
        httpAgent: new AgentKeepAlive({
          keepAlive: true,
          timeout: 2 * httpAgentKeepAliveTimeout,
          freeSocketTimeout: httpAgentKeepAliveTimeout,
        }),
      }),
    )

    // env vars
    container.bind(TYPES.ApiGateway_SYNCING_SERVER_JS_URL).toConstantValue(env.get('SYNCING_SERVER_JS_URL', true))
    container.bind(TYPES.ApiGateway_AUTH_SERVER_URL).toConstantValue(env.get('AUTH_SERVER_URL', true))
    container.bind(TYPES.ApiGateway_REVISIONS_SERVER_URL).toConstantValue(env.get('REVISIONS_SERVER_URL', true))
    container.bind(TYPES.ApiGateway_EMAIL_SERVER_URL).toConstantValue(env.get('EMAIL_SERVER_URL', true))
    container.bind(TYPES.ApiGateway_PAYMENTS_SERVER_URL).toConstantValue(env.get('PAYMENTS_SERVER_URL', true))
    container.bind(TYPES.ApiGateway_FILES_SERVER_URL).toConstantValue(env.get('FILES_SERVER_URL', true))
    container.bind(TYPES.ApiGateway_WEB_SOCKET_SERVER_URL).toConstantValue(env.get('WEB_SOCKET_SERVER_URL', true))
    container.bind(TYPES.ApiGateway_AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container
      .bind(TYPES.ApiGateway_HTTP_CALL_TIMEOUT)
      .toConstantValue(env.get('HTTP_CALL_TIMEOUT', true) ? +env.get('HTTP_CALL_TIMEOUT', true) : 60_000)
    container.bind(TYPES.ApiGateway_VERSION).toConstantValue(env.get('VERSION', true) ?? 'development')
    container
      .bind(TYPES.ApiGateway_CROSS_SERVICE_TOKEN_CACHE_TTL)
      .toConstantValue(+env.get('CROSS_SERVICE_TOKEN_CACHE_TTL', true))
    container.bind(TYPES.ApiGateway_IS_CONFIGURED_FOR_HOME_SERVER).toConstantValue(isConfiguredForHomeServer)
    container
      .bind<string[]>(TYPES.ApiGateway_CORS_ALLOWED_ORIGINS)
      .toConstantValue(env.get('CORS_ALLOWED_ORIGINS', true) ? env.get('CORS_ALLOWED_ORIGINS', true).split(',') : [])
    container.bind<string>(TYPES.ApiGateway_CAPTCHA_UI_URL).toConstantValue(env.get('CAPTCHA_UI_URL', true))

    // Middleware
    container
      .bind<RequiredCrossServiceTokenMiddleware>(TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
      .to(RequiredCrossServiceTokenMiddleware)
    container
      .bind<OptionalCrossServiceTokenMiddleware>(TYPES.ApiGateway_OptionalCrossServiceTokenMiddleware)
      .to(OptionalCrossServiceTokenMiddleware)
    container
      .bind<SubscriptionTokenAuthMiddleware>(TYPES.ApiGateway_SubscriptionTokenAuthMiddleware)
      .to(SubscriptionTokenAuthMiddleware)

    // Services
    container.bind<TimerInterface>(TYPES.ApiGateway_Timer).toConstantValue(new Timer())

    if (isConfiguredForInMemoryCache) {
      container
        .bind<CrossServiceTokenCacheInterface>(TYPES.ApiGateway_CrossServiceTokenCache)
        .toConstantValue(new InMemoryCrossServiceTokenCache(container.get(TYPES.ApiGateway_Timer)))
    } else {
      container
        .bind<CrossServiceTokenCacheInterface>(TYPES.ApiGateway_CrossServiceTokenCache)
        .toConstantValue(new RedisCrossServiceTokenCache(container.get(TYPES.ApiGateway_Redis)))
    }
    container
      .bind<EndpointResolverInterface>(TYPES.ApiGateway_EndpointResolver)
      .toConstantValue(new EndpointResolver(isConfiguredForHomeServer))

    if (isConfiguredForHomeServer) {
      if (!configuration?.serviceContainer) {
        throw new Error('Service container is required when configured for home server')
      }
      container
        .bind<ServiceProxyInterface>(TYPES.ApiGateway_ServiceProxy)
        .toConstantValue(
          new DirectCallServiceProxy(configuration.serviceContainer, container.get(TYPES.ApiGateway_FILES_SERVER_URL)),
        )
    } else {
      if (isConfiguredForGRPCProxy) {
        container.bind(TYPES.ApiGateway_AUTH_SERVER_GRPC_URL).toConstantValue(env.get('AUTH_SERVER_GRPC_URL'))
        container.bind(TYPES.ApiGateway_SYNCING_SERVER_GRPC_URL).toConstantValue(env.get('SYNCING_SERVER_GRPC_URL'))
        const grpcAgentKeepAliveTimeout = env.get('GRPC_AGENT_KEEP_ALIVE_TIMEOUT', true)
          ? +env.get('GRPC_AGENT_KEEP_ALIVE_TIMEOUT', true)
          : 20_000

        const grpcMaxMessageSize = env.get('GRPC_MAX_MESSAGE_SIZE', true)
          ? +env.get('GRPC_MAX_MESSAGE_SIZE', true)
          : 1024 * 1024 * 50

        container.bind<IAuthClient>(TYPES.ApiGateway_GRPCAuthClient).toConstantValue(
          new AuthClient(
            container.get<string>(TYPES.ApiGateway_AUTH_SERVER_GRPC_URL),
            grpc.credentials.createInsecure(),
            {
              'grpc.keepalive_timeout_ms': grpcAgentKeepAliveTimeout,
              'grpc.default_compression_algorithm': grpc.compressionAlgorithms.gzip,
              'grpc.default_compression_level': 2,
              'grpc.max_receive_message_length': grpcMaxMessageSize,
              'grpc.max_send_message_length': grpcMaxMessageSize,
            },
          ),
        )
        container.bind<ISyncingClient>(TYPES.ApiGateway_GRPCSyncingClient).toConstantValue(
          new SyncingClient(
            container.get<string>(TYPES.ApiGateway_SYNCING_SERVER_GRPC_URL),
            grpc.credentials.createInsecure(),
            {
              'grpc.keepalive_timeout_ms': grpcAgentKeepAliveTimeout,
              'grpc.default_compression_algorithm': grpc.compressionAlgorithms.gzip,
              'grpc.default_compression_level': 2,
              'grpc.max_receive_message_length': grpcMaxMessageSize,
              'grpc.max_send_message_length': grpcMaxMessageSize,
            },
          ),
        )

        container
          .bind<MapperInterface<Record<string, unknown>, SyncRequest>>(TYPES.Mapper_SyncRequestGRPCMapper)
          .toConstantValue(new SyncRequestGRPCMapper())
        container
          .bind<MapperInterface<SyncResponse, SyncResponseHttpRepresentation>>(TYPES.Mapper_SyncResponseGRPCMapper)
          .toConstantValue(new SyncResponseGRPCMapper())

        container
          .bind<DomainEventFactoryInterface>(TYPES.ApiGateway_DomainEventFactory)
          .toConstantValue(new DomainEventFactory(container.get<TimerInterface>(TYPES.ApiGateway_Timer)))

        container
          .bind<GRPCSyncingServerServiceProxy>(TYPES.ApiGateway_GRPCSyncingServerServiceProxy)
          .toConstantValue(
            new GRPCSyncingServerServiceProxy(
              container.get<ISyncingClient>(TYPES.ApiGateway_GRPCSyncingClient),
              container.get<MapperInterface<Record<string, unknown>, SyncRequest>>(TYPES.Mapper_SyncRequestGRPCMapper),
              container.get<MapperInterface<SyncResponse, SyncResponseHttpRepresentation>>(
                TYPES.Mapper_SyncResponseGRPCMapper,
              ),
              container.get<winston.Logger>(TYPES.ApiGateway_Logger),
              container.get<DomainEventFactoryInterface>(TYPES.ApiGateway_DomainEventFactory),
              isConfiguredForHomeServerOrSelfHosting
                ? undefined
                : container.get<DomainEventPublisherInterface>(TYPES.ApiGateway_DomainEventPublisher),
            ),
          )
        container
          .bind<ServiceProxyInterface>(TYPES.ApiGateway_ServiceProxy)
          .toConstantValue(
            new GRPCServiceProxy(
              container.get<AxiosInstance>(TYPES.ApiGateway_HTTPClient),
              container.get<string>(TYPES.ApiGateway_AUTH_SERVER_URL),
              container.get<string>(TYPES.ApiGateway_SYNCING_SERVER_JS_URL),
              container.get<string>(TYPES.ApiGateway_PAYMENTS_SERVER_URL),
              container.get<string>(TYPES.ApiGateway_FILES_SERVER_URL),
              container.get<string>(TYPES.ApiGateway_WEB_SOCKET_SERVER_URL),
              container.get<string>(TYPES.ApiGateway_REVISIONS_SERVER_URL),
              container.get<string>(TYPES.ApiGateway_EMAIL_SERVER_URL),
              container.get<number>(TYPES.ApiGateway_HTTP_CALL_TIMEOUT),
              container.get<CrossServiceTokenCacheInterface>(TYPES.ApiGateway_CrossServiceTokenCache),
              container.get<winston.Logger>(TYPES.ApiGateway_Logger),
              container.get<TimerInterface>(TYPES.ApiGateway_Timer),
              container.get<IAuthClient>(TYPES.ApiGateway_GRPCAuthClient),
              container.get<GRPCSyncingServerServiceProxy>(TYPES.ApiGateway_GRPCSyncingServerServiceProxy),
            ),
          )
      } else {
        container.bind<ServiceProxyInterface>(TYPES.ApiGateway_ServiceProxy).to(HttpServiceProxy)
      }
    }

    if (isConfiguredForGRPCProxy) {
      container
        .bind<GRPCWebSocketAuthMiddleware>(TYPES.ApiGateway_WebSocketAuthMiddleware)
        .toConstantValue(
          new GRPCWebSocketAuthMiddleware(
            container.get<IAuthClient>(TYPES.ApiGateway_GRPCAuthClient),
            container.get<string>(TYPES.ApiGateway_AUTH_JWT_SECRET),
            container.get<winston.Logger>(TYPES.ApiGateway_Logger),
          ),
        )
    } else {
      container.bind<WebSocketAuthMiddleware>(TYPES.ApiGateway_WebSocketAuthMiddleware).to(WebSocketAuthMiddleware)
    }

    logger.debug('Configuration complete')

    return container
  }
}
