import { DataSource, EntityTarget, LoggerOptions, ObjectLiteral, Repository } from 'typeorm'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'
import { Env } from './Env'
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import { SQLLegacyItem } from '../Infra/TypeORM/SQLLegacyItem'
import { TypeORMNotification } from '../Infra/TypeORM/TypeORMNotification'
import { TypeORMSharedVault } from '../Infra/TypeORM/TypeORMSharedVault'
import { TypeORMSharedVaultUser } from '../Infra/TypeORM/TypeORMSharedVaultUser'
import { TypeORMSharedVaultInvite } from '../Infra/TypeORM/TypeORMSharedVaultInvite'
import { TypeORMMessage } from '../Infra/TypeORM/TypeORMMessage'
import { SQLItem } from '../Infra/TypeORM/SQLItem'

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

    const isConfiguredForMySQL = this.configuration.env.get('DB_TYPE') === 'mysql'
    const isConfiguredForHomeServerOrSelfHosting =
      this.configuration.env.get('MODE', true) === 'home-server' ||
      this.configuration.env.get('MODE', true) === 'self-hosted'

    const maxQueryExecutionTime = this.configuration.env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
      ? +this.configuration.env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
      : 45_000

    const migrationsSourceDirectoryName = isConfiguredForMySQL
      ? isConfiguredForHomeServerOrSelfHosting
        ? 'mysql'
        : 'mysql-legacy'
      : 'sqlite'

    const commonDataSourceOptions = {
      maxQueryExecutionTime,
      entities: [
        isConfiguredForHomeServerOrSelfHosting ? SQLItem : SQLLegacyItem,
        TypeORMNotification,
        TypeORMSharedVault,
        TypeORMSharedVaultUser,
        TypeORMSharedVaultInvite,
        TypeORMMessage,
      ],
      migrations: [`${__dirname}/../../migrations/${migrationsSourceDirectoryName}/*.js`],
      migrationsRun: this.configuration.runMigrations,
      logging: <LoggerOptions>this.configuration.env.get('DB_DEBUG_LEVEL', true) ?? 'info',
    }

    if (isConfiguredForMySQL) {
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
    } else {
      const sqliteDataSourceOptions: SqliteConnectionOptions = {
        ...commonDataSourceOptions,
        type: 'sqlite',
        database: this.configuration.env.get('DB_SQLITE_DATABASE_PATH'),
        enableWAL: true,
        busyErrorRetry: 2000,
      }

      this._dataSource = new DataSource(sqliteDataSourceOptions)
    }

    return this._dataSource
  }
}
