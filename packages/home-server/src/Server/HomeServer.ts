import 'reflect-metadata'

import { ControllerContainer, ServiceContainer } from '@standardnotes/domain-core'
import { Service as ApiGatewayService } from '@standardnotes/api-gateway'
import { Service as FilesService } from '@standardnotes/files-server'
import { DirectCallDomainEventPublisher } from '@standardnotes/domain-events-infra'
import { Service as AuthService } from '@standardnotes/auth-server'
import { Service as SyncingService } from '@standardnotes/syncing-server'
import { Service as RevisionsService } from '@standardnotes/revisions-server'
import { Container } from 'inversify'
import { InversifyExpressServer } from 'inversify-express-utils'
import helmet from 'helmet'
import * as cors from 'cors'
import * as http from 'http'
import { text, json, Request, Response, NextFunction } from 'express'
import * as winston from 'winston'
import { PassThrough } from 'stream'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const robots = require('express-robots-txt')

import { Env } from '../Bootstrap/Env'
import { HomeServerInterface } from './HomeServerInterface'

export class HomeServer implements HomeServerInterface {
  private serverInstance: http.Server | undefined

  async start(): Promise<void> {
    const controllerContainer = new ControllerContainer()
    const serviceContainer = new ServiceContainer()
    const directCallDomainEventPublisher = new DirectCallDomainEventPublisher()

    const env: Env = new Env()
    env.load()

    this.configureLoggers(env)

    const apiGatewayService = new ApiGatewayService(serviceContainer)
    apiGatewayService.setLogger(winston.loggers.get('api-gateway'))
    const authService = new AuthService(serviceContainer, controllerContainer, directCallDomainEventPublisher)
    authService.setLogger(winston.loggers.get('auth-server'))
    const syncingService = new SyncingService(serviceContainer, controllerContainer, directCallDomainEventPublisher)
    syncingService.setLogger(winston.loggers.get('syncing-server'))
    const revisionsService = new RevisionsService(serviceContainer, controllerContainer, directCallDomainEventPublisher)
    revisionsService.setLogger(winston.loggers.get('revisions-server'))
    const filesService = new FilesService(serviceContainer, directCallDomainEventPublisher)
    filesService.setLogger(winston.loggers.get('files-server'))

    const container = Container.merge(
      (await apiGatewayService.getContainer()) as Container,
      (await authService.getContainer()) as Container,
      (await syncingService.getContainer()) as Container,
      (await revisionsService.getContainer()) as Container,
      (await filesService.getContainer()) as Container,
    )

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

    const logger: winston.Logger = winston.loggers.get('home-server')

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

    this.serverInstance = server.build().listen(env.get('PORT', true) ? +env.get('PORT', true) : 3000)

    logger.info(`Server started on port ${process.env.PORT}`)
  }

  async stop(): Promise<void> {
    if (this.serverInstance) {
      this.serverInstance.close()
    }
  }

  async restart(): Promise<void> {
    await this.stop()
    await this.start()
  }

  async isRunning(): Promise<boolean> {
    if (!this.serverInstance) {
      return false
    }

    return this.serverInstance.address() !== null
  }

  async logs(): Promise<NodeJS.ReadableStream> {
    const passThroughStream = new PassThrough()

    for (const logger of winston.loggers.loggers.values()) {
      logger.stream({ start: -1 }).pipe(passThroughStream, { end: false })
    }

    return passThroughStream
  }

  private configureLoggers(env: Env): void {
    const winstonFormatters = [winston.format.splat(), winston.format.json()]

    for (const loggerName of [
      'auth-server',
      'syncing-server',
      'revisions-server',
      'files-server',
      'api-gateway',
      'home-server',
    ]) {
      winston.loggers.add(loggerName, {
        level: env.get('LOG_LEVEL') || 'info',
        format: winston.format.combine(...winstonFormatters),
        transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' })],
        defaultMeta: { service: loggerName },
      })
    }
  }
}
