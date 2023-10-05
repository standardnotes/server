import * as winston from 'winston'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios')
import { AxiosInstance } from 'axios'
import Redis from 'ioredis'
import { Container } from 'inversify'
import { Timer, TimerInterface } from '@standardnotes/time'

import { Env } from './Env'
import { TYPES } from './Types'
import { ServiceProxyInterface } from '../Service/Http/ServiceProxyInterface'
import { HttpServiceProxy } from '../Service/Http/HttpServiceProxy'
import { SubscriptionTokenAuthMiddleware } from '../Controller/SubscriptionTokenAuthMiddleware'
import { CrossServiceTokenCacheInterface } from '../Service/Cache/CrossServiceTokenCacheInterface'
import { RedisCrossServiceTokenCache } from '../Infra/Redis/RedisCrossServiceTokenCache'
import { WebSocketAuthMiddleware } from '../Controller/WebSocketAuthMiddleware'
import { InMemoryCrossServiceTokenCache } from '../Infra/InMemory/InMemoryCrossServiceTokenCache'
import { DirectCallServiceProxy } from '../Service/Proxy/DirectCallServiceProxy'
import { ServiceContainerInterface } from '@standardnotes/domain-core'
import { EndpointResolverInterface } from '../Service/Resolver/EndpointResolverInterface'
import { EndpointResolver } from '../Service/Resolver/EndpointResolver'
import { RequiredCrossServiceTokenMiddleware } from '../Controller/RequiredCrossServiceTokenMiddleware'
import { OptionalCrossServiceTokenMiddleware } from '../Controller/OptionalCrossServiceTokenMiddleware'
import { Transform } from 'stream'

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
    const isConfiguredForAWSProduction = !isConfiguredForHomeServer && !isConfiguredForSelfHosting
    const isConfiguredForInMemoryCache = env.get('CACHE_TYPE', true) === 'memory'

    const winstonFormatters = [winston.format.splat(), winston.format.json()]
    if (env.get('NEW_RELIC_ENABLED', true) === 'true') {
      await import('newrelic')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const newrelicFormatter = require('@newrelic/winston-enricher')
      const newrelicWinstonFormatter = newrelicFormatter(winston)
      winstonFormatters.push(newrelicWinstonFormatter())
    }

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

    container.bind<AxiosInstance>(TYPES.ApiGateway_HTTPClient).toConstantValue(axios.create())

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
      .bind<boolean>(TYPES.ApiGateway_IS_CONFIGURED_FOR_AWS_PRODUCTION)
      .toConstantValue(isConfiguredForAWSProduction)

    // Middleware
    container
      .bind<RequiredCrossServiceTokenMiddleware>(TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
      .to(RequiredCrossServiceTokenMiddleware)
    container
      .bind<OptionalCrossServiceTokenMiddleware>(TYPES.ApiGateway_OptionalCrossServiceTokenMiddleware)
      .to(OptionalCrossServiceTokenMiddleware)
    container.bind<WebSocketAuthMiddleware>(TYPES.ApiGateway_WebSocketAuthMiddleware).to(WebSocketAuthMiddleware)
    container
      .bind<SubscriptionTokenAuthMiddleware>(TYPES.ApiGateway_SubscriptionTokenAuthMiddleware)
      .to(SubscriptionTokenAuthMiddleware)

    // Services
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
      container.bind<ServiceProxyInterface>(TYPES.ApiGateway_ServiceProxy).to(HttpServiceProxy)
    }
    container.bind<TimerInterface>(TYPES.ApiGateway_Timer).toConstantValue(new Timer())

    if (isConfiguredForHomeServer) {
      container
        .bind<CrossServiceTokenCacheInterface>(TYPES.ApiGateway_CrossServiceTokenCache)
        .toConstantValue(new InMemoryCrossServiceTokenCache(container.get(TYPES.ApiGateway_Timer)))
    } else {
      container
        .bind<CrossServiceTokenCacheInterface>(TYPES.ApiGateway_CrossServiceTokenCache)
        .to(RedisCrossServiceTokenCache)
    }
    container
      .bind<EndpointResolverInterface>(TYPES.ApiGateway_EndpointResolver)
      .toConstantValue(new EndpointResolver(isConfiguredForHomeServer))

    logger.debug('Configuration complete')

    return container
  }
}
