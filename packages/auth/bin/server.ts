import 'reflect-metadata'

import 'newrelic'

import * as Sentry from '@sentry/node'

import '../src/Controller/HealthCheckController'
import '../src/Controller/SessionController'
import '../src/Controller/SessionsController'
import '../src/Controller/UsersController'
import '../src/Controller/SettingsController'
import '../src/Controller/FeaturesController'
import '../src/Controller/WebSocketsController'
import '../src/Controller/AdminController'
import '../src/Controller/InternalController'
import '../src/Controller/SubscriptionTokensController'
import '../src/Controller/OfflineController'
import '../src/Controller/ValetTokenController'
import '../src/Controller/ListedController'
import '../src/Controller/SubscriptionSettingsController'

import '../src/Infra/InversifyExpressUtils/InversifyExpressAuthController'
import '../src/Infra/InversifyExpressUtils/InversifyExpressSubscriptionInvitesController'

import * as cors from 'cors'
import { urlencoded, json, Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express'
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
      response.setHeader('X-Auth-Version', container.get(TYPES.VERSION))
      next()
    })
    app.use(json())
    app.use(urlencoded({ extended: true }))
    app.use(cors())

    if (env.get('SENTRY_DSN', true)) {
      Sentry.init({
        dsn: env.get('SENTRY_DSN'),
        integrations: [new Sentry.Integrations.Http({ tracing: false, breadcrumbs: true })],
        tracesSampleRate: 0,
      })

      app.use(Sentry.Handlers.requestHandler() as RequestHandler)
    }
  })

  const logger: winston.Logger = container.get(TYPES.Logger)

  server.setErrorConfig((app) => {
    if (env.get('SENTRY_DSN', true)) {
      app.use(Sentry.Handlers.errorHandler() as ErrorRequestHandler)
    }

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
