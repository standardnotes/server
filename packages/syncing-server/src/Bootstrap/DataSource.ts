import { DataSource, EntityTarget, LoggerOptions, MongoRepository, ObjectLiteral, Repository } from 'typeorm'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'
import { Env } from './Env'
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import { TypeORMItem } from '../Infra/TypeORM/TypeORMItem'
import { TypeORMNotification } from '../Infra/TypeORM/TypeORMNotification'
import { TypeORMSharedVaultAssociation } from '../Infra/TypeORM/TypeORMSharedVaultAssociation'
import { TypeORMKeySystemAssociation } from '../Infra/TypeORM/TypeORMKeySystemAssociation'
import { TypeORMSharedVault } from '../Infra/TypeORM/TypeORMSharedVault'
import { TypeORMSharedVaultUser } from '../Infra/TypeORM/TypeORMSharedVaultUser'
import { TypeORMSharedVaultInvite } from '../Infra/TypeORM/TypeORMSharedVaultInvite'
import { TypeORMMessage } from '../Infra/TypeORM/TypeORMMessage'
import { MongoDBItem } from '../Infra/TypeORM/MongoDBItem'

export class AppDataSource {
  private _dataSource: DataSource | undefined
  private _secondaryDataSource: DataSource | undefined

  constructor(private env: Env) {}

  getRepository<Entity extends ObjectLiteral>(target: EntityTarget<Entity>): Repository<Entity> {
    if (!this._dataSource) {
      throw new Error('DataSource not initialized')
    }

    return this._dataSource.getRepository(target)
  }

  getMongoRepository<Entity extends ObjectLiteral>(target: EntityTarget<Entity>): MongoRepository<Entity> {
    if (!this._secondaryDataSource) {
      throw new Error('Secondary DataSource not initialized')
    }

    return this._secondaryDataSource.getMongoRepository(target)
  }

  async initialize(): Promise<void> {
    await this.dataSource.initialize()
    const secondaryDataSource = this.secondaryDataSource
    if (secondaryDataSource) {
      await secondaryDataSource.initialize()
    }
  }

  get secondaryDataSource(): DataSource | undefined {
    this.env.load()

    if (this.env.get('SECONDARY_DB_ENABLED', true) !== 'true') {
      return undefined
    }

    this._secondaryDataSource = new DataSource({
      type: 'mongodb',
      host: this.env.get('MONGO_HOST'),
      port: parseInt(this.env.get('MONGO_PORT')),
      username: this.env.get('MONGO_USERNAME'),
      password: this.env.get('MONGO_PASSWORD', true),
      database: this.env.get('MONGO_DATABASE'),
      entities: [MongoDBItem],
      synchronize: true,
    })

    return this._secondaryDataSource
  }

  get dataSource(): DataSource {
    this.env.load()

    const isConfiguredForMySQL = this.env.get('DB_TYPE') === 'mysql'

    const maxQueryExecutionTime = this.env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
      ? +this.env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
      : 45_000

    const commonDataSourceOptions = {
      maxQueryExecutionTime,
      entities: [
        TypeORMItem,
        TypeORMNotification,
        TypeORMSharedVaultAssociation,
        TypeORMKeySystemAssociation,
        TypeORMSharedVault,
        TypeORMSharedVaultUser,
        TypeORMSharedVaultInvite,
        TypeORMMessage,
      ],
      migrations: [`${__dirname}/../../migrations/${isConfiguredForMySQL ? 'mysql' : 'sqlite'}/*.js`],
      migrationsRun: true,
      logging: <LoggerOptions>this.env.get('DB_DEBUG_LEVEL', true) ?? 'info',
    }

    if (isConfiguredForMySQL) {
      const inReplicaMode = this.env.get('DB_REPLICA_HOST', true) ? true : false

      const replicationConfig = {
        master: {
          host: this.env.get('DB_HOST'),
          port: parseInt(this.env.get('DB_PORT')),
          username: this.env.get('DB_USERNAME'),
          password: this.env.get('DB_PASSWORD'),
          database: this.env.get('DB_DATABASE'),
        },
        slaves: [
          {
            host: this.env.get('DB_REPLICA_HOST', true),
            port: parseInt(this.env.get('DB_PORT')),
            username: this.env.get('DB_USERNAME'),
            password: this.env.get('DB_PASSWORD'),
            database: this.env.get('DB_DATABASE'),
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
        host: inReplicaMode ? undefined : this.env.get('DB_HOST'),
        port: inReplicaMode ? undefined : parseInt(this.env.get('DB_PORT')),
        username: inReplicaMode ? undefined : this.env.get('DB_USERNAME'),
        password: inReplicaMode ? undefined : this.env.get('DB_PASSWORD'),
        database: inReplicaMode ? undefined : this.env.get('DB_DATABASE'),
      }

      this._dataSource = new DataSource(mySQLDataSourceOptions)
    } else {
      const sqliteDataSourceOptions: SqliteConnectionOptions = {
        ...commonDataSourceOptions,
        type: 'sqlite',
        database: this.env.get('DB_SQLITE_DATABASE_PATH'),
        enableWAL: true,
        busyErrorRetry: 2000,
      }

      this._dataSource = new DataSource(sqliteDataSourceOptions)
    }

    return this._dataSource
  }
}
