import 'reflect-metadata'

import * as busboy from 'connect-busboy'

import '../src/Infra/InversifyExpress/AnnotatedFallbackController'
import '../src/Infra/InversifyExpress/AnnotatedHealthCheckController'
import '../src/Infra/InversifyExpress/AnnotatedFilesController'
import '../src/Infra/InversifyExpress/AnnotatedSharedVaultFilesController'

import helmet from 'helmet'
import * as cors from 'cors'
import { urlencoded, json, raw, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const robots = require('express-robots-txt')

import { InversifyExpressServer } from 'inversify-express-utils'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'

const container = new ContainerConfigLoader('server')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const requestPayloadLimit = env.get('HTTP_REQUEST_PAYLOAD_LIMIT_MEGABYTES', true)
    ? `${+env.get('HTTP_REQUEST_PAYLOAD_LIMIT_MEGABYTES', true)}mb`
    : '50mb'

  const server = new InversifyExpressServer(container)

  server.setConfig((app) => {
    app.use((_request: Request, response: Response, next: NextFunction) => {
      response.setHeader('X-Files-Version', container.get(TYPES.Files_VERSION))
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
    app.use(json({ limit: requestPayloadLimit }))
    app.use(raw({ limit: requestPayloadLimit, type: 'application/octet-stream' }))
    app.use(urlencoded({ extended: true, limit: requestPayloadLimit }))

    const corsAllowedOrigins = container.get<string[]>(TYPES.Files_CORS_ALLOWED_ORIGINS)

    app.use(
      cors({
        credentials: true,
        exposedHeaders: [
          'Content-Range',
          'Accept-Ranges',
          'Access-Control-Allow-Credentials',
          'Access-Control-Allow-Origin',
        ],
        origin: (requestOrigin: string | undefined, callback: (err: Error | null, origin?: string[]) => void) => {
          const originStrictModeEnabled = env.get('CORS_ORIGIN_STRICT_MODE_ENABLED', true)
            ? env.get('CORS_ORIGIN_STRICT_MODE_ENABLED', true) === 'true'
            : false

          if (!originStrictModeEnabled) {
            callback(null, [requestOrigin as string])

            return
          }

          const requstOriginIsNotFilled = !requestOrigin || requestOrigin === 'null'
          const requestOriginatesFromTheDesktopApp = requestOrigin?.startsWith('file://')
          const requestOriginatesFromClipperForFirefox = requestOrigin?.startsWith('moz-extension://')
          const requestOriginatesFromSelfHostedAppOnHttpPort = requestOrigin === 'http://localhost'
          const requestOriginatesFromSelfHostedAppOnCustomPort = requestOrigin?.match(/http:\/\/localhost:\d+/) !== null
          const requestOriginatesFromSelfHostedApp =
            requestOriginatesFromSelfHostedAppOnHttpPort || requestOriginatesFromSelfHostedAppOnCustomPort

          const requestIsWhitelisted =
            corsAllowedOrigins.length === 0 ||
            requstOriginIsNotFilled ||
            requestOriginatesFromTheDesktopApp ||
            requestOriginatesFromClipperForFirefox ||
            requestOriginatesFromSelfHostedApp

          if (requestIsWhitelisted) {
            callback(null, [requestOrigin as string])
          } else {
            if (corsAllowedOrigins.includes(requestOrigin)) {
              callback(null, [requestOrigin])
            } else {
              callback(new Error('Not allowed by CORS', { cause: 'origin not allowed' }))
            }
          }
        },
      }),
    )
    app.use(
      robots({
        UserAgent: '*',
        Disallow: '/',
      }),
    )
  })

  const logger: winston.Logger = container.get(TYPES.Files_Logger)

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

  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server')
    serverInstance.close(() => {
      logger.info('HTTP server closed')
    })
  })

  logger.info(`Server started on port ${process.env.PORT}`)
})
