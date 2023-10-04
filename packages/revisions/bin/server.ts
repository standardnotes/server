import 'reflect-metadata'

import * as cors from 'cors'
import { urlencoded, json, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'
import * as AWSXRay from 'aws-xray-sdk'

import { InversifyExpressServer } from 'inversify-express-utils'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'

import '../src/Infra/InversifyExpress/AnnotatedRevisionsController'
import '../src/Infra/InversifyExpress/AnnotatedHealthCheckController'
import { ServiceIdentifier } from '@standardnotes/domain-core'

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = container.get(TYPES.Revisions_Env)

  const isConfiguredForAWSProduction =
    env.get('MODE', true) !== 'home-server' && env.get('MODE', true) !== 'self-hosted'

  if (isConfiguredForAWSProduction) {
    AWSXRay.config([AWSXRay.plugins.ECSPlugin])
  }

  const server = new InversifyExpressServer(container)

  server.setConfig((app) => {
    if (isConfiguredForAWSProduction) {
      app.use(AWSXRay.express.openSegment(ServiceIdentifier.NAMES.Revisions))
    }

    app.use((_request: Request, response: Response, next: NextFunction) => {
      response.setHeader('X-Revisions-Version', container.get(TYPES.Revisions_VERSION))
      next()
    })
    app.use(json())
    app.use(urlencoded({ extended: true }))
    app.use(cors())
  })

  const logger: winston.Logger = container.get(TYPES.Revisions_Logger)

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

  if (isConfiguredForAWSProduction) {
    serverInstance.use(AWSXRay.express.closeSegment())
  }

  serverInstance.listen(env.get('PORT'))

  logger.info(`Server started on port ${process.env.PORT}`)
})
