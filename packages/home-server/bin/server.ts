import 'reflect-metadata'

import {
  ContainerConfigLoader as APIGatewayContainerConfigLoader,
  TYPES as APIGatewayTYPES,
  LegacyController,
  HealthCheckController,
  SessionsController,
  UsersController,
  ActionsController,
  InvoicesController,
  RevisionsController,
  ItemsController,
  PaymentsController,
  WebSocketsController,
  TokensController,
  OfflineController,
  FilesController,
  SubscriptionInvitesController,
  AuthenticatorsController,
  PaymentsControllerV2,
  ActionsControllerV2,
  RevisionsControllerV2,
} from '@standardnotes/api-gateway'

import helmet from 'helmet'
import * as cors from 'cors'
import { text, json, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const robots = require('express-robots-txt')

import { InversifyExpressServer } from 'inversify-express-utils'
import { Env } from '../src/Bootstrap/Env'

void LegacyController
void HealthCheckController
void SessionsController
void UsersController
void ActionsController
void InvoicesController
void RevisionsController
void ItemsController
void PaymentsController
void WebSocketsController
void TokensController
void OfflineController
void FilesController
void SubscriptionInvitesController
void AuthenticatorsController
void PaymentsControllerV2
void ActionsControllerV2
void RevisionsControllerV2

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

  serverInstance.listen(env.get('PORT'))

  logger.info(`Server started on port ${process.env.PORT}`)
})
