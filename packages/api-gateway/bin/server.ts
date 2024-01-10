import 'reflect-metadata'

import '../src/Controller/LegacyController'
import '../src/Controller/HealthCheckController'

import '../src/Controller/v1/SessionsController'
import '../src/Controller/v1/UsersController'
import '../src/Controller/v1/ActionsController'
import '../src/Controller/v1/InvoicesController'
import '../src/Controller/v1/RevisionsController'
import '../src/Controller/v1/ItemsController'
import '../src/Controller/v1/PaymentsController'
import '../src/Controller/v1/WebSocketsController'
import '../src/Controller/v1/TokensController'
import '../src/Controller/v1/OfflineController'
import '../src/Controller/v1/FilesController'
import '../src/Controller/v1/SubscriptionInvitesController'
import '../src/Controller/v1/AuthenticatorsController'
import '../src/Controller/v1/MessagesController'
import '../src/Controller/v1/SharedVaultsController'
import '../src/Controller/v1/SharedVaultInvitesController'
import '../src/Controller/v1/SharedVaultUsersController'

import '../src/Controller/v2/PaymentsControllerV2'
import '../src/Controller/v2/ActionsControllerV2'
import '../src/Controller/v2/RevisionsControllerV2'

import helmet from 'helmet'
import * as cors from 'cors'
import { text, json, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const robots = require('express-robots-txt')

import { InversifyExpressServer } from 'inversify-express-utils'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import { TYPES } from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { ResponseLocals } from '../src/Controller/ResponseLocals'

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const requestPayloadLimit = env.get('HTTP_REQUEST_PAYLOAD_LIMIT_MEGABYTES', true)
    ? `${+env.get('HTTP_REQUEST_PAYLOAD_LIMIT_MEGABYTES', true)}mb`
    : '50mb'

  const server = new InversifyExpressServer(container)

  server.setConfig((app) => {
    app.use((_request: Request, response: Response, next: NextFunction) => {
      response.setHeader('X-API-Gateway-Version', container.get(TYPES.ApiGateway_VERSION))
      next()
    })
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["https: 'self'"],
            baseUri: ["'self'"],
            childSrc: ['*', 'blob:'],
            connectSrc: ['*'],
            fontSrc: ['*', "'self'"],
            formAction: ["'self'"],
            frameAncestors: ['*', '*.standardnotes.org', '*.standardnotes.com'],
            frameSrc: ['*', 'blob:'],
            imgSrc: ["'self'", '*', 'data:'],
            manifestSrc: ["'self'"],
            mediaSrc: ["'self'"],
            objectSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
          },
        },
      }),
    )

    app.use(json({ limit: requestPayloadLimit }))
    app.use(
      text({
        type: ['text/plain', 'application/x-www-form-urlencoded', 'application/x-www-form-urlencoded; charset=utf-8'],
      }),
    )
    app.use(cors())
    app.use(
      robots({
        UserAgent: '*',
        Disallow: '/',
      }),
    )
  })

  const logger: winston.Logger = container.get(TYPES.ApiGateway_Logger)

  server.setErrorConfig((app) => {
    app.use((error: Record<string, unknown>, request: Request, response: Response, _next: NextFunction) => {
      const locals = response.locals as ResponseLocals

      logger.error(`${error.stack}`, {
        method: request.method,
        url: request.url,
        snjs: request.headers['x-snjs-version'],
        application: request.headers['x-application-version'],
        userId: locals.user ? locals.user.uuid : undefined,
      })
      logger.debug(
        `[URL: |${request.method}| ${request.url}][SNJS: ${request.headers['x-snjs-version']}][Application: ${
          request.headers['x-application-version']
        }] Request body: ${JSON.stringify(request.body)}`,
      )

      if ('type' in error && error.type === 'entity.too.large') {
        response.status(413).send({
          error: {
            message: 'The request payload is too large.',
          },
        })

        return
      }

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

  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server')
    serverInstance.close(() => {
      logger.info('HTTP server closed')
    })
  })

  logger.info(`Server started on port ${process.env.PORT}`)
})
