import 'reflect-metadata'

import 'newrelic'

import * as Sentry from '@sentry/node'
import * as busboy from 'connect-busboy'

import '../src/Controller/HealthCheckController'
import '../src/Controller/FilesController'

import helmet from 'helmet'
import * as cors from 'cors'
import { urlencoded, json, raw, Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express'
import * as winston from 'winston'

import { InversifyExpressServer } from 'inversify-express-utils'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const server = new InversifyExpressServer(container)

  server.setConfig((app) => {
    app.use((_request: Request, response: Response, next: NextFunction) => {
      response.setHeader('X-Files-Version', container.get(TYPES.VERSION))
      next()
    })
    app.use(
      busboy({
        highWaterMark: 2 * 1024 * 1024,
      }),
    )
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
    app.use(raw({ limit: '50mb', type: 'application/octet-stream' }))
    app.use(urlencoded({ extended: true, limit: '50mb' }))
    app.use(
      cors({
        exposedHeaders: ['Content-Range', 'Accept-Ranges'],
      }),
    )

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
