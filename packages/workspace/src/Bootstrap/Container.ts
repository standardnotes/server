import * as winston from 'winston'
import Redis from 'ioredis'
import * as AWS from 'aws-sdk'
import { Container } from 'inversify'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import { TimerInterface, Timer } from '@standardnotes/time'
import { Env } from './Env'
import TYPES from './Types'
import { AppDataSource } from './DataSource'
import {
  RedisDomainEventPublisher,
  RedisDomainEventSubscriberFactory,
  RedisEventMessageHandler,
  SNSDomainEventPublisher,
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { ApiGatewayAuthMiddleware } from '../Controller/ApiGatewayAuthMiddleware'
import { CrossServiceTokenData, TokenDecoder, TokenDecoderInterface } from '@standardnotes/security'
import { WorkspaceRepositoryInterface } from '../Domain/Workspace/WorkspaceRepositoryInterface'
import { MySQLWorkspaceRepository } from '../Infra/MySQL/MySQLWorkspaceRepository'
import { WorkspaceUserRepositoryInterface } from '../Domain/Workspace/WorkspaceUserRepositoryInterface'
import { MySQLWorkspaceUserRepository } from '../Infra/MySQL/MySQLWorkspaceUserRepository'
import { Repository } from 'typeorm'
import { Workspace } from '../Domain/Workspace/Workspace'
import { WorkspaceUser } from '../Domain/Workspace/WorkspaceUser'
import { CreateWorkspace } from '../Domain/UseCase/CreateWorkspace/CreateWorkspace'
import { WorkspacesController } from '../Controller/WorkspacesController'
import { UserRegisteredEventHandler } from '../Domain/Handler/UserRegisteredEventHandler'
import { WorkspaceInviteRepositoryInterface } from '../Domain/Invite/WorkspaceInviteRepositoryInterface'
import { MySQLWorkspaceInviteRepository } from '../Infra/MySQL/MySQLWorkspaceInviteRepository'
import { WorkspaceInvite } from '../Domain/Invite/WorkspaceInvite'
import { InviteToWorkspace } from '../Domain/UseCase/InviteToWorkspace/InviteToWorkspace'
import { DomainEventFactory } from '../Domain/Event/DomainEventFactory'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { WorkspaceProjection } from '../Domain/Projection/WorkspaceProjection'
import { WorkspaceProjector } from '../Domain/Projection/WorkspaceProjector'
import { ProjectorInterface } from '../Domain/Projection/ProjectorInterface'
import { WorkspaceUserProjection } from '../Domain/Projection/WorkspaceUserProjection'
import { WorkspaceUserProjector } from '../Domain/Projection/WorkspaceUserProjector'
import { AcceptInvitation } from '../Domain/UseCase/AcceptInvitation/AcceptInvitation'
import { ListWorkspaces } from '../Domain/UseCase/ListWorkspaces/ListWorkspaces'
import { ListWorkspaceUsers } from '../Domain/UseCase/ListWorkspaceUsers/ListWorkspaceUsers'
import { InitiateKeyShare } from '../Domain/UseCase/InitiateKeyShare/InitiateKeyShare'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicFormatter = require('@newrelic/winston-enricher')

export class ContainerConfigLoader {
  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

    await AppDataSource.initialize()

    const redisUrl = env.get('REDIS_URL')
    const isRedisInClusterMode = redisUrl.indexOf(',') > 0
    let redis
    if (isRedisInClusterMode) {
      redis = new Redis.Cluster(redisUrl.split(','))
    } else {
      redis = new Redis(redisUrl)
    }

    container.bind(TYPES.Redis).toConstantValue(redis)

    const newrelicWinstonFormatter = newrelicFormatter(winston)
    const winstonFormatters = [winston.format.splat(), winston.format.json()]
    if (env.get('NEW_RELIC_ENABLED', true) === 'true') {
      winstonFormatters.push(newrelicWinstonFormatter())
    }

    const logger = winston.createLogger({
      level: env.get('LOG_LEVEL') || 'info',
      format: winston.format.combine(...winstonFormatters),
      transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' })],
    })
    container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

    if (env.get('SNS_TOPIC_ARN', true)) {
      const snsConfig: AWS.SNS.Types.ClientConfiguration = {
        apiVersion: 'latest',
        region: env.get('SNS_AWS_REGION', true),
      }
      if (env.get('SNS_ENDPOINT', true)) {
        snsConfig.endpoint = env.get('SNS_ENDPOINT', true)
      }
      if (env.get('SNS_DISABLE_SSL', true) === 'true') {
        snsConfig.sslEnabled = false
      }
      if (env.get('SNS_ACCESS_KEY_ID', true) && env.get('SNS_SECRET_ACCESS_KEY', true)) {
        snsConfig.credentials = {
          accessKeyId: env.get('SNS_ACCESS_KEY_ID', true),
          secretAccessKey: env.get('SNS_SECRET_ACCESS_KEY', true),
        }
      }
      container.bind<AWS.SNS>(TYPES.SNS).toConstantValue(new AWS.SNS(snsConfig))
    }

    if (env.get('SQS_QUEUE_URL', true)) {
      const sqsConfig: AWS.SQS.Types.ClientConfiguration = {
        apiVersion: 'latest',
        region: env.get('SQS_AWS_REGION', true),
      }
      if (env.get('SQS_ACCESS_KEY_ID', true) && env.get('SQS_SECRET_ACCESS_KEY', true)) {
        sqsConfig.credentials = {
          accessKeyId: env.get('SQS_ACCESS_KEY_ID', true),
          secretAccessKey: env.get('SQS_SECRET_ACCESS_KEY', true),
        }
      }
      container.bind<AWS.SQS>(TYPES.SQS).toConstantValue(new AWS.SQS(sqsConfig))
    }

    // Controller
    container.bind<WorkspacesController>(TYPES.WorkspacesController).to(WorkspacesController)
    // Repositories
    container.bind<WorkspaceRepositoryInterface>(TYPES.WorkspaceRepository).to(MySQLWorkspaceRepository)
    container.bind<WorkspaceUserRepositoryInterface>(TYPES.WorkspaceUserRepository).to(MySQLWorkspaceUserRepository)
    container
      .bind<WorkspaceInviteRepositoryInterface>(TYPES.WorkspaceInviteRepository)
      .to(MySQLWorkspaceInviteRepository)
    // ORM
    container
      .bind<Repository<Workspace>>(TYPES.ORMWorkspaceRepository)
      .toConstantValue(AppDataSource.getRepository(Workspace))
    container
      .bind<Repository<WorkspaceUser>>(TYPES.ORMWorkspaceUserRepository)
      .toConstantValue(AppDataSource.getRepository(WorkspaceUser))
    container
      .bind<Repository<WorkspaceInvite>>(TYPES.ORMWorkspaceInviteRepository)
      .toConstantValue(AppDataSource.getRepository(WorkspaceInvite))
    // Middleware
    container.bind<ApiGatewayAuthMiddleware>(TYPES.ApiGatewayAuthMiddleware).to(ApiGatewayAuthMiddleware)
    // env vars
    container.bind(TYPES.AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
    container.bind(TYPES.SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN', true))
    container.bind(TYPES.SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL', true))
    container.bind(TYPES.REDIS_EVENTS_CHANNEL).toConstantValue(env.get('REDIS_EVENTS_CHANNEL'))
    container.bind(TYPES.NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))

    // use cases
    container.bind<CreateWorkspace>(TYPES.CreateWorkspace).to(CreateWorkspace)
    container.bind<InviteToWorkspace>(TYPES.InviteToWorkspace).to(InviteToWorkspace)
    container.bind<AcceptInvitation>(TYPES.AcceptInvitation).to(AcceptInvitation)
    container.bind<ListWorkspaces>(TYPES.ListWorkspaces).to(ListWorkspaces)
    container.bind<ListWorkspaceUsers>(TYPES.ListWorkspaceUsers).to(ListWorkspaceUsers)
    container.bind<InitiateKeyShare>(TYPES.InitiateKeyShare).to(InitiateKeyShare)
    // Handlers
    container.bind<UserRegisteredEventHandler>(TYPES.UserRegisteredEventHandler).to(UserRegisteredEventHandler)
    // Projection
    container.bind<ProjectorInterface<Workspace, WorkspaceProjection>>(TYPES.WorkspaceProjector).to(WorkspaceProjector)
    container
      .bind<ProjectorInterface<WorkspaceUser, WorkspaceUserProjection>>(TYPES.WorkspaceUserProjector)
      .to(WorkspaceUserProjector)
    // Services
    container.bind<DomainEventFactoryInterface>(TYPES.DomainEventFactory).to(DomainEventFactory)
    container.bind<TimerInterface>(TYPES.Timer).toConstantValue(new Timer())
    container
      .bind<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.CrossServiceTokenDecoder)
      .toConstantValue(new TokenDecoder<CrossServiceTokenData>(container.get(TYPES.AUTH_JWT_SECRET)))

    if (env.get('SNS_TOPIC_ARN', true)) {
      container
        .bind<SNSDomainEventPublisher>(TYPES.DomainEventPublisher)
        .toConstantValue(new SNSDomainEventPublisher(container.get(TYPES.SNS), container.get(TYPES.SNS_TOPIC_ARN)))
    } else {
      container
        .bind<RedisDomainEventPublisher>(TYPES.DomainEventPublisher)
        .toConstantValue(
          new RedisDomainEventPublisher(container.get(TYPES.Redis), container.get(TYPES.REDIS_EVENTS_CHANNEL)),
        )
    }

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['USER_REGISTERED', container.get(TYPES.UserRegisteredEventHandler)],
    ])

    if (env.get('SQS_QUEUE_URL', true)) {
      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler)
        .toConstantValue(
          env.get('NEW_RELIC_ENABLED', true) === 'true'
            ? new SQSNewRelicEventMessageHandler(eventHandlers, container.get(TYPES.Logger))
            : new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Logger)),
        )
      container
        .bind<DomainEventSubscriberFactoryInterface>(TYPES.DomainEventSubscriberFactory)
        .toConstantValue(
          new SQSDomainEventSubscriberFactory(
            container.get(TYPES.SQS),
            container.get(TYPES.SQS_QUEUE_URL),
            container.get(TYPES.DomainEventMessageHandler),
          ),
        )
    } else {
      container
        .bind<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler)
        .toConstantValue(new RedisEventMessageHandler(eventHandlers, container.get(TYPES.Logger)))
      container
        .bind<DomainEventSubscriberFactoryInterface>(TYPES.DomainEventSubscriberFactory)
        .toConstantValue(
          new RedisDomainEventSubscriberFactory(
            container.get(TYPES.Redis),
            container.get(TYPES.DomainEventMessageHandler),
            container.get(TYPES.REDIS_EVENTS_CHANNEL),
          ),
        )
    }

    return container
  }
}
