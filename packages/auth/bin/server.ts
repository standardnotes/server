import 'reflect-metadata'

import '../src/Infra/InversifyExpressUtils/AnnotatedAuthController'
import '../src/Infra/InversifyExpressUtils/AnnotatedAuthenticatorsController'
import '../src/Infra/InversifyExpressUtils/AnnotatedSessionsController'
import '../src/Infra/InversifyExpressUtils/AnnotatedSubscriptionInvitesController'
import '../src/Infra/InversifyExpressUtils/AnnotatedUserRequestsController'
import '../src/Infra/InversifyExpressUtils/AnnotatedWebSocketsController'
import '../src/Infra/InversifyExpressUtils/AnnotatedUsersController'
import '../src/Infra/InversifyExpressUtils/AnnotatedValetTokenController'
import '../src/Infra/InversifyExpressUtils/AnnotatedAdminController'
import '../src/Infra/InversifyExpressUtils/AnnotatedSubscriptionTokensController'
import '../src/Infra/InversifyExpressUtils/AnnotatedSubscriptionSettingsController'
import '../src/Infra/InversifyExpressUtils/AnnotatedSettingsController'
import '../src/Infra/InversifyExpressUtils/AnnotatedSessionController'
import '../src/Infra/InversifyExpressUtils/AnnotatedOfflineController'
import '../src/Infra/InversifyExpressUtils/AnnotatedListedController'
import '../src/Infra/InversifyExpressUtils/AnnotatedInternalController'
import '../src/Infra/InversifyExpressUtils/AnnotatedHealthCheckController'
import '../src/Infra/InversifyExpressUtils/AnnotatedFeaturesController'

import * as cors from 'cors'
import * as grpc from '@grpc/grpc-js'
import { urlencoded, json, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

import { InversifyExpressServer } from 'inversify-express-utils'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { AuthServer } from '../src/Infra/gRPC/AuthServer'
import { AuthService } from '@standardnotes/grpc'
import { AuthenticateRequest } from '../src/Domain/UseCase/AuthenticateRequest'
import { CreateCrossServiceToken } from '../src/Domain/UseCase/CreateCrossServiceToken/CreateCrossServiceToken'
import { TokenDecoderInterface, WebSocketConnectionTokenData } from '@standardnotes/security'

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const server = new InversifyExpressServer(container)

  server.setConfig((app) => {
    app.use((_request: Request, response: Response, next: NextFunction) => {
      response.setHeader('X-Auth-Version', container.get(TYPES.Auth_VERSION))
      next()
    })
    app.use(json())
    app.use(urlencoded({ extended: true }))
    app.use(cors())
  })

  const logger: winston.Logger = container.get(TYPES.Auth_Logger)

  server.setErrorConfig((app) => {
    app.use((error: Record<string, unknown>, request: Request, response: Response, _next: NextFunction) => {
      logger.error(`${error.stack}`, {
        method: request.method,
        url: request.url,
        snjs: request.headers['x-snjs-version'],
        application: request.headers['x-application-version'],
        userId: response.locals.user ? response.locals.user.uuid : undefined,
      })

      response.status(500).send({
        error: {
          message:
            "Unfortunately, we couldn't handle your request. Please try again or contact our support if the error persists.",
        },
      })
    })
  })

  const serverInstance = server.build().listen(env.get('PORT'))

  const httpKeepAliveTimeout = env.get('HTTP_KEEP_ALIVE_TIMEOUT', true)
    ? +env.get('HTTP_KEEP_ALIVE_TIMEOUT', true)
    : 10_000

  serverInstance.keepAliveTimeout = httpKeepAliveTimeout

  const grpcKeepAliveTimeout = env.get('GRPC_KEEP_ALIVE_TIMEOUT', true)
    ? +env.get('GRPC_KEEP_ALIVE_TIMEOUT', true)
    : 10_000

  const grpcMaxMessageSize = env.get('GRPC_MAX_MESSAGE_SIZE', true)
    ? +env.get('GRPC_MAX_MESSAGE_SIZE', true)
    : 1024 * 1024 * 50

  const grpcServer = new grpc.Server({
    'grpc.keepalive_time_ms': grpcKeepAliveTimeout * 2,
    'grpc.keepalive_timeout_ms': grpcKeepAliveTimeout,
    'grpc.default_compression_algorithm': grpc.compressionAlgorithms.gzip,
    'grpc.max_receive_message_length': grpcMaxMessageSize,
    'grpc.max_send_message_length': grpcMaxMessageSize,
  })

  const gRPCPort = env.get('GRPC_PORT', true) ? +env.get('GRPC_PORT', true) : 50051

  const authServer = new AuthServer(
    container.get<AuthenticateRequest>(TYPES.Auth_AuthenticateRequest),
    container.get<CreateCrossServiceToken>(TYPES.Auth_CreateCrossServiceToken),
    container.get<TokenDecoderInterface<WebSocketConnectionTokenData>>(TYPES.Auth_WebSocketConnectionTokenDecoder),
    container.get<winston.Logger>(TYPES.Auth_Logger),
  )

  grpcServer.addService(AuthService, {
    validate: authServer.validate.bind(authServer),
    validateWebsocket: authServer.validateWebsocket.bind(authServer),
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
