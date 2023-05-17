import 'reflect-metadata'

import { ControllerContainer, ServiceContainer } from '@standardnotes/domain-core'
import { Service as ApiGatewayService, TYPES as ApiGatewayTYPES } from '@standardnotes/api-gateway'
import { DirectCallDomainEventPublisher } from '@standardnotes/domain-events-infra'
import { Service as AuthService } from '@standardnotes/auth-server'
import { Service as SyncingService } from '@standardnotes/syncing-server'
import { Container } from 'inversify'
import { InversifyExpressServer } from 'inversify-express-utils'
import helmet from 'helmet'
import * as cors from 'cors'
import { text, json, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const robots = require('express-robots-txt')

import { Env } from '../src/Bootstrap/Env'

const startServer = async (): Promise<void> => {
  const controllerContainer = new ControllerContainer()
  const serviceContainer = new ServiceContainer()
  const directCallDomainEventPublisher = new DirectCallDomainEventPublisher()

  const apiGatewayService = new ApiGatewayService(serviceContainer, controllerContainer)
  const authService = new AuthService(serviceContainer, controllerContainer, directCallDomainEventPublisher)
  const syncingService = new SyncingService(serviceContainer, controllerContainer, directCallDomainEventPublisher)

  const container = Container.merge(
    (await apiGatewayService.getContainer()) as Container,
    (await authService.getContainer()) as Container,
    (await syncingService.getContainer()) as Container,
  )

  const env: Env = new Env()
  env.load()

  const server = new InversifyExpressServer(container)

  server.setConfig((app) => {
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

  const logger: winston.Logger = container.get(ApiGatewayTYPES.Logger)

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

  serverInstance.listen(env.get('PORT', true) ? +env.get('PORT', true) : 3000)

  logger.info(`Server started on port ${process.env.PORT}`)
}

Promise.resolve(startServer())
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Server started')
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.log(`Could not start server: ${error.message}`)
  })
