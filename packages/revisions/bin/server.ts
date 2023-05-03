import 'reflect-metadata'

import 'newrelic'

import * as cors from 'cors'
import { urlencoded, json, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'

import { InversifyExpressServer } from 'inversify-express-utils'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { ServerContainerConfigLoader } from '../src/Bootstrap/ServerContainerConfigLoader'

import '../src/Infra/InversifyExpress/InversifyExpressRevisionsController'
import '../src/Infra/InversifyExpress/InversifyExpressHealthCheckController'

const container = new ServerContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = container.get(TYPES.Env)

  const server = new InversifyExpressServer(container)

  server.setConfig((app) => {
    app.use((_request: Request, response: Response, next: NextFunction) => {
      response.setHeader('X-Revisions-Version', container.get(TYPES.VERSION))
      next()
    })
    app.use(json())
    app.use(urlencoded({ extended: true }))
    app.use(cors())
  })

  const logger: winston.Logger = container.get(TYPES.Logger)

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
