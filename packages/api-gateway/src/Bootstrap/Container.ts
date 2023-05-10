import * as winston from 'winston'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios')
import { AxiosInstance } from 'axios'
import Redis from 'ioredis'
import { Container } from 'inversify'
import { Timer, TimerInterface } from '@standardnotes/time'

import { Env } from './Env'
import { TYPES } from './Types'
import { AuthMiddleware } from '../Controller/AuthMiddleware'
import { ServiceProxyInterface } from '../Service/Http/ServiceProxyInterface'
import { HttpServiceProxy } from '../Service/Http/HttpServiceProxy'
import { SubscriptionTokenAuthMiddleware } from '../Controller/SubscriptionTokenAuthMiddleware'
import { CrossServiceTokenCacheInterface } from '../Service/Cache/CrossServiceTokenCacheInterface'
import { RedisCrossServiceTokenCache } from '../Infra/Redis/RedisCrossServiceTokenCache'
import { WebSocketAuthMiddleware } from '../Controller/WebSocketAuthMiddleware'
import { InMemoryCrossServiceTokenCache } from '../Infra/InMemory/InMemoryCrossServiceTokenCache'
import { DirectCallServiceProxy } from '../Service/Proxy/DirectCallServiceProxy'
import { ContainerConfigurationInterface, ServiceContainerInterface } from '@standardnotes/domain-core'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicFormatter = require('@newrelic/winston-enricher')

export class ContainerConfigLoader implements ContainerConfigurationInterface {
  async load(serviceContainer?: ServiceContainerInterface): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

    const isConfiguredForHomeServer = env.get('CACHE_TYPE') === 'memory'

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

    if (!isConfiguredForHomeServer) {
      const redisUrl = env.get('REDIS_URL')
      const isRedisInClusterMode = redisUrl.indexOf(',') > 0
      let redis
      if (isRedisInClusterMode) {
        redis = new Redis.Cluster(redisUrl.split(','))
      } else {
        redis = new Redis(redisUrl)
      }
      container.bind(TYPES.Redis).toConstantValue(redis)
    }

    container.bind<AxiosInstance>(TYPES.HTTPClient).toConstantValue(axios.create())

    // env vars
    container.bind(TYPES.SYNCING_SERVER_JS_URL).toConstantValue(env.get('SYNCING_SERVER_JS_URL'))
    container.bind(TYPES.AUTH_SERVER_URL).toConstantValue(env.get('AUTH_SERVER_URL'))
    container.bind(TYPES.REVISIONS_SERVER_URL).toConstantValue(env.get('REVISIONS_SERVER_URL', true))
    container.bind(TYPES.EMAIL_SERVER_URL).toConstantValue(env.get('EMAIL_SERVER_URL', true))
    container.bind(TYPES.PAYMENTS_SERVER_URL).toConstantValue(env.get('PAYMENTS_SERVER_URL', true))
    container.bind(TYPES.FILES_SERVER_URL).toConstantValue(env.get('FILES_SERVER_URL', true))
    container.bind(TYPES.AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container.bind(TYPES.WEB_SOCKET_SERVER_URL).toConstantValue(env.get('WEB_SOCKET_SERVER_URL', true))
    container
      .bind(TYPES.HTTP_CALL_TIMEOUT)
      .toConstantValue(env.get('HTTP_CALL_TIMEOUT', true) ? +env.get('HTTP_CALL_TIMEOUT', true) : 60_000)
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))
    container.bind(TYPES.CROSS_SERVICE_TOKEN_CACHE_TTL).toConstantValue(+env.get('CROSS_SERVICE_TOKEN_CACHE_TTL', true))

    // Middleware
    container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
    container.bind<WebSocketAuthMiddleware>(TYPES.WebSocketAuthMiddleware).to(WebSocketAuthMiddleware)
    container
      .bind<SubscriptionTokenAuthMiddleware>(TYPES.SubscriptionTokenAuthMiddleware)
      .to(SubscriptionTokenAuthMiddleware)

    // Services
    if (isConfiguredForHomeServer) {
      if (!serviceContainer) {
        throw new Error('Service container is required when configured for home server')
      }
      container
        .bind<ServiceProxyInterface>(TYPES.DirectCallServiceProxy)
        .toConstantValue(new DirectCallServiceProxy(serviceContainer))
    } else {
      container.bind<ServiceProxyInterface>(TYPES.HTTPService).to(HttpServiceProxy)
    }
    container.bind<TimerInterface>(TYPES.Timer).toConstantValue(new Timer())

    if (isConfiguredForHomeServer) {
      container
        .bind<CrossServiceTokenCacheInterface>(TYPES.CrossServiceTokenCache)
        .toConstantValue(new InMemoryCrossServiceTokenCache(container.get(TYPES.Timer)))
    } else {
      container.bind<CrossServiceTokenCacheInterface>(TYPES.CrossServiceTokenCache).to(RedisCrossServiceTokenCache)
    }

    return container
  }
}
