import 'reflect-metadata'

import 'newrelic'

import '../src/Infra/InversifyExpressUtils/InversifyExpressAuthController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressAuthenticatorsController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressSessionsController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressSubscriptionInvitesController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressUserRequestsController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressWebSocketsController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressUsersController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressValetTokenController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressAdminController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressSubscriptionTokensController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressSubscriptionSettingsController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressSettingsController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressSessionController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressOfflineController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressListedController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressInternalController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressHealthCheckController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressFeaturesController'

import * as cors from 'cors'
import { urlencoded, json, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

import { InversifyExpressServer } from 'inversify-express-utils'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'

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
