import 'reflect-metadata'

import * as prettyjson from 'prettyjson'

import {
  ContainerConfigLoader as APIGatewayContainerConfigLoader,
  TYPES as APIGatewayTYPES,
  LegacyController as _LegacyController,
  HealthCheckController as _HealthCheckController,
  SessionsController as _SessionsController,
  UsersController as _UsersController,
  ActionsController as _ActionsController,
  InvoicesController as _InvoicesController,
  RevisionsController as _RevisionsController,
  ItemsController as _ItemsController,
  PaymentsController as _PaymentsController,
  WebSocketsController as _WebSocketsController,
  TokensController as _TokensController,
  OfflineController as _OfflineController,
  FilesController as _FilesController,
  SubscriptionInvitesController as _SubscriptionInvitesController,
  AuthenticatorsController as _AuthenticatorsController,
  PaymentsControllerV2 as _PaymentsControllerV2,
  ActionsControllerV2 as _ActionsControllerV2,
  RevisionsControllerV2 as _RevisionsControllerV2,
} from '@standardnotes/api-gateway'

import helmet from 'helmet'
import * as cors from 'cors'
import { text, json, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const robots = require('express-robots-txt')

import { InversifyExpressServer, getRouteInfo } from 'inversify-express-utils'
import { Env } from '../src/Bootstrap/Env'

const container = new APIGatewayContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const server = new InversifyExpressServer(container)

  server.setConfig((app) => {
    app.use((_request: Request, response: Response, next: NextFunction) => {
      response.setHeader('X-API-Gateway-Version', container.get(APIGatewayTYPES.VERSION))
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
          frameAncestors: ["*", "*.standardnotes.org", "*.standardnotes.com"],
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

  const logger: winston.Logger = container.get(APIGatewayTYPES.Logger)

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

  const serverInstance = server.build()

  const routeInfo = getRouteInfo(container)

  // eslint-disable-next-line no-console
  console.info(prettyjson.render({ routes: routeInfo }))

  serverInstance.listen(env.get('PORT'))

  logger.info(`Server started on port ${process.env.PORT}`)
})
