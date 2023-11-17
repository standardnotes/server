import 'reflect-metadata'

import '../src/Infra/InversifyExpressUtils/AnnotatedFallbackController'
import '../src/Infra/InversifyExpressUtils/AnnotatedHealthCheckController'
import '../src/Infra/InversifyExpressUtils/AnnotatedItemsController'
import '../src/Infra/InversifyExpressUtils/AnnotatedMessagesController'
import '../src/Infra/InversifyExpressUtils/AnnotatedSharedVaultInvitesController'
import '../src/Infra/InversifyExpressUtils/AnnotatedSharedVaultUsersController'
import '../src/Infra/InversifyExpressUtils/AnnotatedSharedVaultsController'

import helmet from 'helmet'
import * as cors from 'cors'
import * as grpc from '@grpc/grpc-js'
import { urlencoded, json, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'
import { InversifyExpressServer } from 'inversify-express-utils'
import { MapperInterface } from '@standardnotes/domain-core'
import { SyncResponse, SyncingService } from '@standardnotes/grpc'

import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import { SyncingServer } from '../src/Infra/gRPC/SyncingServer'
import { SyncItems } from '../src/Domain/UseCase/Syncing/SyncItems/SyncItems'
import { SyncResponseFactoryResolverInterface } from '../src/Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { SyncResponse20200115 } from '../src/Domain/Item/SyncResponse/SyncResponse20200115'

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const server = new InversifyExpressServer(container)

  server.setConfig((app) => {
    app.use((_request: Request, response: Response, next: NextFunction) => {
      response.setHeader('X-SSJS-Version', container.get(TYPES.Sync_VERSION))
      next()
    })
    /* eslint-disable */
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["https: 'self'"],
          baseUri: ["'self'"],
          childSrc: ["*", "blob:"],
          connectSrc: ["*"],
          fontSrc: ["*", "'self'"],
          formAction: ["'self'"],
          frameAncestors: ["*", "*.standardnotes.org"],
          frameSrc: ["*", "blob:"],
          imgSrc: ["'self'", "*", "data:"],
          manifestSrc: ["'self'"],
          mediaSrc: ["'self'"],
          objectSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"]
        }
      }
    }))
    /* eslint-enable */
    app.use(json({ limit: '50mb' }))
    app.use(urlencoded({ extended: true, limit: '50mb', parameterLimit: 5000 }))
    app.use(cors())
  })

  const logger: winston.Logger = container.get(TYPES.Sync_Logger)

  server.setErrorConfig((app) => {
    app.use((error: Record<string, unknown>, _request: Request, response: Response, _next: NextFunction) => {
      logger.error(error.stack)

      response.status(500).send({
        error: {
          message:
            "Unfortunately, we couldn't handle your request. Please try again or contact our support if the error persists.",
        },
      })
    })
  })

  const serverInstance = server.build().listen(env.get('PORT'))

  const keepAliveTimeout = env.get('HTTP_KEEP_ALIVE_TIMEOUT', true) ? +env.get('HTTP_KEEP_ALIVE_TIMEOUT', true) : 5000

  serverInstance.keepAliveTimeout = keepAliveTimeout

  const grpcKeepAliveTimeout = env.get('GRPC_KEEP_ALIVE_TIMEOUT', true)
    ? +env.get('GRPC_KEEP_ALIVE_TIMEOUT', true)
    : 10_000

  const grpcServer = new grpc.Server({
    'grpc.keepalive_time_ms': grpcKeepAliveTimeout * 2,
    'grpc.keepalive_timeout_ms': grpcKeepAliveTimeout,
  })

  const gRPCPort = env.get('GRPC_PORT', true) ? +env.get('GRPC_PORT', true) : 50051

  const syncingServer = new SyncingServer(
    container.get<SyncItems>(TYPES.Sync_SyncItems),
    container.get<SyncResponseFactoryResolverInterface>(TYPES.Sync_SyncResponseFactoryResolver),
    container.get<MapperInterface<SyncResponse20200115, SyncResponse>>(TYPES.Sync_SyncResponseGRPCMapper),
    container.get<winston.Logger>(TYPES.Sync_Logger),
  )

  grpcServer.addService(SyncingService, {
    syncItems: syncingServer.syncItems.bind(syncingServer),
  })
  grpcServer.bindAsync(`0.0.0.0:${gRPCPort}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
      logger.error(`Failed to bind gRPC server: ${error.message}`)

      return
    }

    logger.info(`gRPC server bound on port ${port}`)

    grpcServer.start()

    logger.info('gRPC server started')
  })

  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server')
    serverInstance.close(() => {
      logger.info('HTTP server closed')
    })
    grpcServer.tryShutdown((error?: Error) => {
      if (error) {
        logger.error(`Failed to shutdown gRPC server: ${error.message}`)
      } else {
        logger.info('gRPC server closed')
      }
    })
  })

  logger.info(`Server started on port ${process.env.PORT}`)
})
