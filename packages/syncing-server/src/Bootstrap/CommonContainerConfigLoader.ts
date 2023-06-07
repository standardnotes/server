import { TypeORMSharedVaultInviteRepository } from '../Domain/SharedVaultInvite/Repository/TypeORMSharedVaultInviteRepository'
import { AsymmetricMessage } from './../Domain/AsymmetricMessage/Model/AsymmetricMessage'
import { SharedVaultInvite } from '../Domain/SharedVaultInvite/Model/SharedVaultInvite'
import { SharedVaultUser } from '../Domain/SharedVaultUser/Model/SharedVaultUser'
import { SharedVault } from '../Domain/SharedVault/Model/SharedVault'
import { TypeORMSharedVaultRepository } from '../Domain/SharedVault/Repository/TypeORMSharedVaultRepository'
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
import { SharedVaultsRepositoryInterface } from '../Domain/SharedVault/Repository/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../Domain/SharedVaultUser/Repository/SharedVaultUserRepositoryInterface'
import { TypeORMSharedVaultUserRepository } from '../Domain/SharedVaultUser/Repository/TypeORMSharedVaultUserRepository'
import { SharedVaultUserProjection } from '../Projection/SharedVaultUserProjection'
import { SharedVaultUserProjector } from '../Projection/SharedVaultUserProjector'
import { SharedVaultProjection } from '../Projection/SharedVaultProjection'
import { SharedVaultProjector } from '../Projection/SharedVaultProjector'
import { SharedVaultInviteProjection } from '../Projection/SharedVaultInviteProjection'
import { SharedVaultInviteProjector } from '../Projection/SharedVaultInviteProjector'
import { AsymmetricMessageProjection } from '../Projection/AsymmetricMessageProjection'
import { AsymmetricMessageProjector } from '../Projection/AsymmetricMessageProjector'
import { SharedVaultInviteRepositoryInterface } from '../Domain/SharedVaultInvite/Repository/SharedVaultInviteRepositoryInterface'
import { TypeORMAsymmetricMessageRepository } from '../Domain/AsymmetricMessage/Repository/TypeORMAsymmetricMessageRepository'
import { UserEventsRepositoryInterface } from '../Domain/UserEvent/Repository/UserEventRepositoryInterface'
import { TypeORMUserEventRepository } from '../Domain/UserEvent/Repository/TypeORMUserEventRepository'
import { UserEvent } from '../Domain/UserEvent/Model/UserEvent'
import { UserEventProjection } from '../Projection/UserEventProjection'
import { UserEventProjector } from '../Projection/UserEventProjector'
import { AsymmetricMessageRepositoryInterface } from '../Domain/AsymmetricMessage/Repository/AsymmetricMessageRepositoryInterface'
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
      .bind<SharedVaultsRepositoryInterface>(TYPES.SharedVaultRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMSharedVaultRepository(context.container.get(TYPES.ORMSharedVaultRepository))
      })
    container
      .bind<SharedVaultUserRepositoryInterface>(TYPES.SharedVaultUserRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMSharedVaultUserRepository(context.container.get(TYPES.ORMSharedVaultUserRepository))
      })
    container
      .bind<SharedVaultInviteRepositoryInterface>(TYPES.SharedVaultInviteRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMSharedVaultInviteRepository(context.container.get(TYPES.ORMSharedVaultInviteRepository))
      })
    container
      .bind<AsymmetricMessageRepositoryInterface>(TYPES.AsymmetricMessageRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMAsymmetricMessageRepository(context.container.get(TYPES.ORMAsymmetricMessageRepository))
      })
    container
      .bind<UserEventsRepositoryInterface>(TYPES.UserEventRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMUserEventRepository(context.container.get(TYPES.ORMUserEventRepository))
      })

    // ORM
    container.bind<Repository<Item>>(TYPES.ORMItemRepository).toDynamicValue(() => AppDataSource.getRepository(Item))
    container
      .bind<Repository<SharedVault>>(TYPES.ORMSharedVaultRepository)
      .toDynamicValue(() => AppDataSource.getRepository(SharedVault))
    container
      .bind<Repository<SharedVaultUser>>(TYPES.ORMSharedVaultUserRepository)
      .toDynamicValue(() => AppDataSource.getRepository(SharedVaultUser))
    container
      .bind<Repository<SharedVaultInvite>>(TYPES.ORMSharedVaultInviteRepository)
      .toDynamicValue(() => AppDataSource.getRepository(SharedVaultInvite))
    container
      .bind<Repository<AsymmetricMessage>>(TYPES.ORMAsymmetricMessageRepository)
      .toDynamicValue(() => AppDataSource.getRepository(AsymmetricMessage))
    container
      .bind<Repository<UserEvent>>(TYPES.ORMUserEventRepository)
      .toDynamicValue(() => AppDataSource.getRepository(UserEvent))

    // Projectors
    container
      .bind<ProjectorInterface<Item, ItemProjection>>(TYPES.ItemProjector)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemProjector(context.container.get(TYPES.Timer))
      })
    container
      .bind<ProjectorInterface<SharedVault, SharedVaultProjection>>(TYPES.SharedVaultProjector)
      .toDynamicValue(() => {
        return new SharedVaultProjector()
      })
    container
      .bind<ProjectorInterface<SharedVaultUser, SharedVaultUserProjection>>(TYPES.SharedVaultUserProjector)
      .toDynamicValue(() => {
        return new SharedVaultUserProjector()
      })
    container
      .bind<ProjectorInterface<SharedVaultInvite, SharedVaultInviteProjection>>(TYPES.SharedVaultInviteProjector)
      .toDynamicValue(() => {
        return new SharedVaultInviteProjector()
      })
    container
      .bind<ProjectorInterface<AsymmetricMessage, AsymmetricMessageProjection>>(TYPES.AsymmetricMessageProjector)
      .toDynamicValue(() => {
        return new AsymmetricMessageProjector()
      })
    container.bind<ProjectorInterface<UserEvent, UserEventProjection>>(TYPES.UserEventProjector).toDynamicValue(() => {
      return new UserEventProjector()
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
