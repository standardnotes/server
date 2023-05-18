import { MapperInterface } from '@standardnotes/domain-core'
import { Container, interfaces } from 'inversify'
import { Repository } from 'typeorm'
import * as winston from 'winston'

import { Revision } from '../Domain/Revision/Revision'
import { RevisionMetadata } from '../Domain/Revision/RevisionMetadata'
import { RevisionRepositoryInterface } from '../Domain/Revision/RevisionRepositoryInterface'
import { TypeORMRevisionRepository } from '../Infra/TypeORM/TypeORMRevisionRepository'
import { TypeORMRevision } from '../Infra/TypeORM/TypeORMRevision'
import { RevisionMetadataPersistenceMapper } from '../Mapping/RevisionMetadataPersistenceMapper'
import { RevisionPersistenceMapper } from '../Mapping/RevisionPersistenceMapper'
import { AppDataSource } from './DataSource'
import { Env } from './Env'
import TYPES from './Types'

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
        defaultMeta: { service: 'revisions' },
      })

      return logger
    })

    container.bind(TYPES.NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))

    // Map
    container
      .bind<MapperInterface<RevisionMetadata, TypeORMRevision>>(TYPES.RevisionMetadataPersistenceMapper)
      .toDynamicValue(() => new RevisionMetadataPersistenceMapper())
    container
      .bind<MapperInterface<Revision, TypeORMRevision>>(TYPES.RevisionPersistenceMapper)
      .toDynamicValue(() => new RevisionPersistenceMapper())

    // ORM
    container
      .bind<Repository<TypeORMRevision>>(TYPES.ORMRevisionRepository)
      .toDynamicValue(() => AppDataSource.getRepository(TypeORMRevision))

    // Repositories
    container
      .bind<RevisionRepositoryInterface>(TYPES.RevisionRepository)
      .toDynamicValue((context: interfaces.Context) => {
        return new TypeORMRevisionRepository(
          context.container.get(TYPES.ORMRevisionRepository),
          context.container.get(TYPES.RevisionMetadataPersistenceMapper),
          context.container.get(TYPES.RevisionPersistenceMapper),
          context.container.get(TYPES.Logger),
        )
      })

    return container
  }
}
