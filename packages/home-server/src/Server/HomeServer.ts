import 'reflect-metadata'

import { ControllerContainer, Result, ServiceContainer } from '@standardnotes/domain-core'
import { Service as ApiGatewayService } from '@standardnotes/api-gateway'
import { Service as FilesService } from '@standardnotes/files-server'
import { DirectCallDomainEventPublisher } from '@standardnotes/domain-events-infra'
import { Service as AuthService, AuthServiceInterface } from '@standardnotes/auth-server'
import { Service as SyncingService } from '@standardnotes/syncing-server'
import { Service as RevisionsService } from '@standardnotes/revisions-server'
import { Container } from 'inversify'
import { InversifyExpressServer } from 'inversify-express-utils'
import helmet from 'helmet'
import * as cors from 'cors'
import * as http from 'http'
import { text, json, Request, Response, NextFunction, raw } from 'express'
import * as winston from 'winston'
import { PassThrough } from 'stream'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const robots = require('express-robots-txt')

import { Env } from '../Bootstrap/Env'
import { HomeServerInterface } from './HomeServerInterface'
import { HomeServerConfiguration } from './HomeServerConfiguration'

export class HomeServer implements HomeServerInterface {
  private serverInstance: http.Server | undefined
  private authService: AuthServiceInterface | undefined
  private logStream: PassThrough | undefined
  private readonly loggerNames = [
    'auth-server',
    'syncing-server',
    'revisions-server',
    'files-server',
    'api-gateway',
    'home-server',
  ]

  async start(configuration: HomeServerConfiguration): Promise<Result<string>> {
    try {
      const controllerContainer = new ControllerContainer()
      const serviceContainer = new ServiceContainer()
      const directCallDomainEventPublisher = new DirectCallDomainEventPublisher()

      const environmentOverrides = {
        DB_TYPE: 'sqlite',
        CACHE_TYPE: 'memory',
        DB_SQLITE_DATABASE_PATH: `${configuration.dataDirectoryPath}/database/home_server.sqlite`,
        FILE_UPLOAD_PATH: `${configuration.dataDirectoryPath}/uploads`,
        ...configuration.environment,
        MODE: 'home-server',
      }

      const env: Env = new Env(environmentOverrides)
      env.load()

      this.configureLoggers(env, configuration)

      const apiGatewayService = new ApiGatewayService(serviceContainer)
      const authService = new AuthService(serviceContainer, controllerContainer, directCallDomainEventPublisher)
      this.authService = authService
      const syncingService = new SyncingService(serviceContainer, controllerContainer, directCallDomainEventPublisher)
      const revisionsService = new RevisionsService(
        serviceContainer,
        controllerContainer,
        directCallDomainEventPublisher,
      )
      const filesService = new FilesService(serviceContainer, directCallDomainEventPublisher)

      const container = Container.merge(
        (await apiGatewayService.getContainer({
          logger: winston.loggers.get('api-gateway'),
          environmentOverrides,
        })) as Container,
        (await authService.getContainer({
          logger: winston.loggers.get('auth-server'),
          environmentOverrides,
        })) as Container,
        (await syncingService.getContainer({
          logger: winston.loggers.get('syncing-server'),
          environmentOverrides,
        })) as Container,
        (await revisionsService.getContainer({
          logger: winston.loggers.get('revisions-server'),
          environmentOverrides,
        })) as Container,
        (await filesService.getContainer({
          logger: winston.loggers.get('files-server'),
          environmentOverrides,
        })) as Container,
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
        app.use(raw({ limit: '50mb', type: 'application/octet-stream' }))
        app.use(
          text({
            type: [
              'text/plain',
              'application/x-www-form-urlencoded',
              'application/x-www-form-urlencoded; charset=utf-8',
            ],
          }),
        )
        app.use(
          cors({
            exposedHeaders: ['Content-Range', 'Accept-Ranges'],
          }),
        )
        app.use(
          robots({
            UserAgent: '*',
            Disallow: '/',
          }),
        )

        if (env.get('E2E_TESTING', true) === 'true') {
          app.post('/e2e/activate-premium', (request: Request, response: Response) => {
            void this.activatePremiumFeatures({
              username: request.body.username,
              subscriptionId: request.body.subscriptionId,
              subscriptionPlanName: request.body.subscriptionPlanName,
              uploadBytesLimit: request.body.uploadBytesLimit,
              endsAt: request.body.endsAt ? new Date(request.body.endsAt) : undefined,
              cancelPreviousSubscription: request.body.cancelPreviousSubscription,
            }).then((result) => {
              if (result.isFailed()) {
                response.status(400).send({ error: { message: result.getError() } })
              } else {
                response.status(200).send({ message: result.getValue() })
              }
            })
          })
        }
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

      const port = env.get('PORT', true) ? +env.get('PORT', true) : 3000

      const serverInstance = server.build().listen(port)

      this.serverInstance = serverInstance

      process.on('SIGTERM', () => {
        logger.info('SIGTERM signal received: closing HTTP server')
        serverInstance.close(() => {
          logger.info('HTTP server closed')
        })
      })

      logger.info(`Server started on port ${port}. Log level: ${env.get('LOG_LEVEL', true)}.`)

      return Result.ok('Server started.')
    } catch (error) {
      console.error((error as Error).stack)

      return Result.fail((error as Error).message)
    }
  }

  async stop(): Promise<Result<string>> {
    try {
      if (!this.serverInstance) {
        return Result.fail('Home server is not running.')
      }

      for (const loggerName of this.loggerNames) {
        winston.loggers.close(loggerName)
      }

      if (this.logStream) {
        this.logStream.end()
      }

      this.serverInstance.close()
      this.serverInstance.unref()

      this.serverInstance = undefined

      return Result.ok('Server stopped.')
    } catch (error) {
      return Result.fail((error as Error).message)
    }
  }

  async isRunning(): Promise<boolean> {
    if (!this.serverInstance) {
      return false
    }

    return this.serverInstance.address() !== null
  }

  async activatePremiumFeatures(dto: {
    username: string
    subscriptionId: number
    subscriptionPlanName?: string
    uploadBytesLimit?: number
    endsAt?: Date
    cancelPreviousSubscription?: boolean
  }): Promise<Result<string>> {
    if (!this.isRunning() || !this.authService) {
      return Result.fail('Home server is not running.')
    }

    return this.authService.activatePremiumFeatures(dto)
  }

  private configureLoggers(env: Env, configuration: HomeServerConfiguration): void {
    this.logStream = new PassThrough()

    if (configuration.logStreamCallback) {
      this.logStream.on('data', configuration.logStreamCallback)
    }

    const winstonFormatters = [winston.format.splat(), winston.format.json()]

    const level = env.get('LOG_LEVEL', true) || 'info'

    for (const loggerName of this.loggerNames) {
      winston.loggers.add(loggerName, {
        level,
        format: winston.format.combine(...winstonFormatters),
        transports: [
          new winston.transports.Stream({
            level,
            stream: this.logStream,
          }),
        ],
        defaultMeta: { service: loggerName },
      })
    }
  }
}
