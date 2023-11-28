import { DataSource, EntityTarget, LoggerOptions, ObjectLiteral, Repository } from 'typeorm'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'
import { Env } from './Env'
import { SQLConnection } from '../Infra/TypeORM/SQLConnection'

export class AppDataSource {
  private _dataSource: DataSource | undefined

  constructor(
    private configuration: {
      env: Env
      runMigrations: boolean
    },
  ) {}

  getRepository<Entity extends ObjectLiteral>(target: EntityTarget<Entity>): Repository<Entity> {
    if (!this._dataSource) {
      throw new Error('DataSource not initialized')
    }

    return this._dataSource.getRepository(target)
  }

  async initialize(): Promise<void> {
    await this.dataSource.initialize()
  }

  get dataSource(): DataSource {
    this.configuration.env.load()

    const maxQueryExecutionTime = this.configuration.env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
      ? +this.configuration.env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
      : 45_000

    const commonDataSourceOptions = {
      maxQueryExecutionTime,
      entities: [SQLConnection],
      migrations: [`${__dirname}/../../migrations/mysql/*.js`],
      migrationsRun: this.configuration.runMigrations,
      logging: <LoggerOptions>this.configuration.env.get('DB_DEBUG_LEVEL', true) ?? 'info',
    }

    const inReplicaMode = this.configuration.env.get('DB_REPLICA_HOST', true) ? true : false

    const replicationConfig = {
      master: {
        host: this.configuration.env.get('DB_HOST'),
        port: parseInt(this.configuration.env.get('DB_PORT')),
        username: this.configuration.env.get('DB_USERNAME'),
        password: this.configuration.env.get('DB_PASSWORD'),
        database: this.configuration.env.get('DB_DATABASE'),
      },
      slaves: [
        {
          host: this.configuration.env.get('DB_REPLICA_HOST', true),
          port: parseInt(this.configuration.env.get('DB_PORT')),
          username: this.configuration.env.get('DB_USERNAME'),
          password: this.configuration.env.get('DB_PASSWORD'),
          database: this.configuration.env.get('DB_DATABASE'),
        },
      ],
      removeNodeErrorCount: 10,
      restoreNodeTimeout: 5,
    }

    const mySQLDataSourceOptions: MysqlConnectionOptions = {
      ...commonDataSourceOptions,
      type: 'mysql',
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: false,
      replication: inReplicaMode ? replicationConfig : undefined,
      host: inReplicaMode ? undefined : this.configuration.env.get('DB_HOST'),
      port: inReplicaMode ? undefined : parseInt(this.configuration.env.get('DB_PORT')),
      username: inReplicaMode ? undefined : this.configuration.env.get('DB_USERNAME'),
      password: inReplicaMode ? undefined : this.configuration.env.get('DB_PASSWORD'),
      database: inReplicaMode ? undefined : this.configuration.env.get('DB_DATABASE'),
    }

    this._dataSource = new DataSource(mySQLDataSourceOptions)

    return this._dataSource
  }
}
