import { GroupUser } from '../Domain/GroupUser/Model/GroupKey'
import { Group } from './../Domain/Group/Model/Group'
import { TypeORMGroupRepository } from './../Domain/Group/Repository/TypeORMGroupRepository'
import { ItemLink } from '../Domain/ItemLink/Model/ItemLink'
import { TypeORMItemLinkRepository } from '../Domain/ItemLink/Repository/TypeORMItemLinkRepository'
import * as winston from 'winston'
import { Container, interfaces } from 'inversify'

import { Env } from './Env'
import TYPES from './Types'
import { AppDataSource } from './DataSource'
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { ItemRepositoryInterface } from '../Domain/Item/ItemRepositoryInterface'
import { TypeORMItemRepository } from '../Infra/TypeORM/TypeORMItemRepository'
import { Repository } from 'typeorm'
import { Item } from '../Domain/Item/Item'
import { ItemProjection } from '../Projection/ItemProjection'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { ItemProjector } from '../Projection/ItemProjector'
import { SNSDomainEventPublisher } from '@standardnotes/domain-events-infra'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { DomainEventFactory } from '../Domain/Event/DomainEventFactory'
import { Timer, TimerInterface } from '@standardnotes/time'
import { ItemTransferCalculatorInterface } from '../Domain/Item/ItemTransferCalculatorInterface'
import { ItemTransferCalculator } from '../Domain/Item/ItemTransferCalculator'
import { ItemLinksRepositoryInterface } from '../Domain/ItemLink/Repository/ItemLinkRepositoryInterface'
import { GroupsRepositoryInterface } from '../Domain/Group/Repository/GroupRepositoryInterface'
import { GroupUserRepositoryInterface } from '../Domain/GroupUser/Repository/GroupUserRepositoryInterface'
import { TypeORMGroupUserRepository } from '../Domain/GroupUser/Repository/TypeORMGroupUserRepository'
import { GroupUserProjection } from '../Projection/GroupUserProjection'
import { GroupUserProjector } from '../Projection/GroupUserProjector'
import { GroupProjection } from '../Projection/GroupProjection'
import { GroupProjector } from '../Projection/GroupProjector'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicFormatter = require('@newrelic/winston-enricher')

export class CommonContainerConfigLoader {
  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container({
      defaultScope: 'Singleton',
    })

    await AppDataSource.initialize()

    container.bind<Env>(TYPES.Env).toConstantValue(env)

    container.bind<winston.Logger>(TYPES.Logger).toDynamicValue((context: interfaces.Context) => {
      const env: Env = context.container.get(TYPES.Env)

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

      return logger
    })

    container.bind<SNSClient>(TYPES.SNS).toDynamicValue((context: interfaces.Context) => {
      const env: Env = context.container.get(TYPES.Env)

      const snsConfig: SNSClientConfig = {
        apiVersion: 'latest',
        region: env.get('SNS_AWS_REGION', true),
      }
      if (env.get('SNS_ENDPOINT', true)) {
        snsConfig.endpoint = env.get('SNS_ENDPOINT', true)
      }
      if (env.get('SNS_ACCESS_KEY_ID', true) && env.get('SNS_SECRET_ACCESS_KEY', true)) {
        snsConfig.credentials = {
          accessKeyId: env.get('SNS_ACCESS_KEY_ID', true),
          secretAccessKey: env.get('SNS_SECRET_ACCESS_KEY', true),
        }
      }

      return new SNSClient(snsConfig)
    })

    // Repositories
    container.bind<ItemRepositoryInterface>(TYPES.ItemRepository).toDynamicValue((context: interfaces.Context) => {
      return new TypeORMItemRepository(context.container.get(TYPES.ORMItemRepository))
    })
    container
      .bind<ItemLinksRepositoryInterface>(TYPES.ItemLinkRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMItemLinkRepository(context.container.get(TYPES.ORMItemLinkRepository))
      })
    container.bind<GroupsRepositoryInterface>(TYPES.GroupRepository).toDynamicValue((context: interfaces.Context) => {
      return new TypeORMGroupRepository(context.container.get(TYPES.ORMGroupRepository))
    })
    container
      .bind<GroupUserRepositoryInterface>(TYPES.GroupUserRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMGroupUserRepository(context.container.get(TYPES.ORMGroupUserRepository))
      })

    // ORM
    container.bind<Repository<Item>>(TYPES.ORMItemRepository).toDynamicValue(() => AppDataSource.getRepository(Item))
    container
      .bind<Repository<ItemLink>>(TYPES.ORMItemLinkRepository)
      .toDynamicValue(() => AppDataSource.getRepository(ItemLink))
    container.bind<Repository<Group>>(TYPES.ORMGroupRepository).toDynamicValue(() => AppDataSource.getRepository(Group))
    container
      .bind<Repository<GroupUser>>(TYPES.ORMGroupUserRepository)
      .toDynamicValue(() => AppDataSource.getRepository(GroupUser))

    // Projectors
    container
      .bind<ProjectorInterface<Item, ItemProjection>>(TYPES.ItemProjector)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemProjector(context.container.get(TYPES.Timer))
      })
    container
      .bind<ProjectorInterface<GroupUser, GroupUserProjection>>(TYPES.GroupUserProjector)
      .toDynamicValue(() => {
        return new GroupUserProjector()
      })
    container.bind<ProjectorInterface<Group, GroupProjection>>(TYPES.GroupProjector).toDynamicValue(() => {
      return new GroupProjector()
    })

    // env vars
    container.bind(TYPES.SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN'))
    container.bind(TYPES.SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))

    container.bind<TimerInterface>(TYPES.Timer).toDynamicValue(() => new Timer())

    container
      .bind<SNSDomainEventPublisher>(TYPES.DomainEventPublisher)
      .toDynamicValue((context: interfaces.Context) => {
        return new SNSDomainEventPublisher(context.container.get(TYPES.SNS), context.container.get(TYPES.SNS_TOPIC_ARN))
      })

    container
      .bind<DomainEventFactoryInterface>(TYPES.DomainEventFactory)
      .toDynamicValue((context: interfaces.Context) => {
        return new DomainEventFactory(context.container.get(TYPES.Timer))
      })

    container
      .bind<ItemTransferCalculatorInterface>(TYPES.ItemTransferCalculator)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemTransferCalculator(
          context.container.get(TYPES.ItemRepository),
          context.container.get(TYPES.Logger),
        )
      })

    return container
  }
}
