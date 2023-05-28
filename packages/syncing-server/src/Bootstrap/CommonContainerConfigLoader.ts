import { TypeORMVaultInviteRepository } from '../Domain/VaultInvite/Repository/TypeORMVaultInviteRepository'
import { Contact } from './../Domain/Contact/Model/Contact'
import { VaultInvite } from '../Domain/VaultInvite/Model/VaultInvite'
import { VaultUser } from '../Domain/VaultUser/Model/VaultUser'
import { Vault } from '../Domain/Vault/Model/Vault'
import { TypeORMVaultRepository } from '../Domain/Vault/Repository/TypeORMVaultRepository'
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
import { VaultsRepositoryInterface } from '../Domain/Vault/Repository/VaultRepositoryInterface'
import { VaultUserRepositoryInterface } from '../Domain/VaultUser/Repository/VaultUserRepositoryInterface'
import { TypeORMVaultUserRepository } from '../Domain/VaultUser/Repository/TypeORMVaultUserRepository'
import { VaultUserProjection } from '../Projection/VaultUserProjection'
import { VaultUserProjector } from '../Projection/VaultUserProjector'
import { VaultProjection } from '../Projection/VaultProjection'
import { VaultProjector } from '../Projection/VaultProjector'
import { VaultInviteProjection } from '../Projection/VaultInviteProjection'
import { VaultInviteProjector } from '../Projection/VaultInviteProjector'
import { ContactProjection } from '../Projection/ContactProjection'
import { ContactProjector } from '../Projection/ContactProjector'
import { VaultInviteRepositoryInterface } from '../Domain/VaultInvite/Repository/VaultInviteRepositoryInterface'
import { ContactsRepositoryInterface } from '../Domain/Contact/Repository/ContactRepositoryInterface'
import { TypeORMContactRepository } from '../Domain/Contact/Repository/TypeORMContactRepository'
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
    container.bind<VaultsRepositoryInterface>(TYPES.VaultRepository).toDynamicValue((context: interfaces.Context) => {
      return new TypeORMVaultRepository(context.container.get(TYPES.ORMVaultRepository))
    })
    container
      .bind<VaultUserRepositoryInterface>(TYPES.VaultUserRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMVaultUserRepository(context.container.get(TYPES.ORMVaultUserRepository))
      })
    container
      .bind<VaultInviteRepositoryInterface>(TYPES.VaultInviteRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMVaultInviteRepository(context.container.get(TYPES.ORMVaultInviteRepository))
      })
    container
      .bind<ContactsRepositoryInterface>(TYPES.ContactRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMContactRepository(context.container.get(TYPES.ORMContactRepository))
      })

    // ORM
    container.bind<Repository<Item>>(TYPES.ORMItemRepository).toDynamicValue(() => AppDataSource.getRepository(Item))
    container.bind<Repository<Vault>>(TYPES.ORMVaultRepository).toDynamicValue(() => AppDataSource.getRepository(Vault))
    container
      .bind<Repository<VaultUser>>(TYPES.ORMVaultUserRepository)
      .toDynamicValue(() => AppDataSource.getRepository(VaultUser))
    container
      .bind<Repository<VaultInvite>>(TYPES.ORMVaultInviteRepository)
      .toDynamicValue(() => AppDataSource.getRepository(VaultInvite))
    container
      .bind<Repository<Contact>>(TYPES.ORMContactRepository)
      .toDynamicValue(() => AppDataSource.getRepository(Contact))

    // Projectors
    container
      .bind<ProjectorInterface<Item, ItemProjection>>(TYPES.ItemProjector)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemProjector(context.container.get(TYPES.Timer))
      })
    container.bind<ProjectorInterface<Vault, VaultProjection>>(TYPES.VaultProjector).toDynamicValue(() => {
      return new VaultProjector()
    })
    container.bind<ProjectorInterface<VaultUser, VaultUserProjection>>(TYPES.VaultUserProjector).toDynamicValue(() => {
      return new VaultUserProjector()
    })
    container
      .bind<ProjectorInterface<VaultInvite, VaultInviteProjection>>(TYPES.VaultInviteProjector)
      .toDynamicValue(() => {
        return new VaultInviteProjector()
      })
    container.bind<ProjectorInterface<Contact, ContactProjection>>(TYPES.ContactProjector).toDynamicValue(() => {
      return new ContactProjector()
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
