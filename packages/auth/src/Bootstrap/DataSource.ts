import { DataSource, EntityTarget, LoggerOptions, ObjectLiteral, Repository } from 'typeorm'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'
import { Permission } from '../Domain/Permission/Permission'
import { Role } from '../Domain/Role/Role'
import { RevokedSession } from '../Domain/Session/RevokedSession'
import { Session } from '../Domain/Session/Session'
import { OfflineSetting } from '../Domain/Setting/OfflineSetting'
import { SharedSubscriptionInvitation } from '../Domain/SharedSubscription/SharedSubscriptionInvitation'
import { OfflineUserSubscription } from '../Domain/Subscription/OfflineUserSubscription'
import { UserSubscription } from '../Domain/Subscription/UserSubscription'
import { User } from '../Domain/User/User'
import { TypeORMAuthenticator } from '../Infra/TypeORM/TypeORMAuthenticator'
import { TypeORMAuthenticatorChallenge } from '../Infra/TypeORM/TypeORMAuthenticatorChallenge'
import { TypeORMCacheEntry } from '../Infra/TypeORM/TypeORMCacheEntry'
import { TypeORMEmergencyAccessInvitation } from '../Infra/TypeORM/TypeORMEmergencyAccessInvitation'
import { TypeORMSessionTrace } from '../Infra/TypeORM/TypeORMSessionTrace'
import { Env } from './Env'
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import { TypeORMSharedVaultUser } from '../Infra/TypeORM/TypeORMSharedVaultUser'
import { TypeORMSubscriptionSetting } from '../Infra/TypeORM/TypeORMSubscriptionSetting'
import { TypeORMSetting } from '../Infra/TypeORM/TypeORMSetting'

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

    const maxQueryExecutionTime = this.configuration.env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
      ? +this.configuration.env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
      : 45_000

    const commonDataSourceOptions = {
      maxQueryExecutionTime,
      entities: [
        User,
        UserSubscription,
        OfflineUserSubscription,
        Session,
        RevokedSession,
        Role,
        Permission,
        TypeORMSetting,
        OfflineSetting,
        SharedSubscriptionInvitation,
        TypeORMSubscriptionSetting,
        TypeORMSessionTrace,
        TypeORMAuthenticator,
        TypeORMAuthenticatorChallenge,
        TypeORMEmergencyAccessInvitation,
        TypeORMCacheEntry,
        TypeORMSharedVaultUser,
      ],
      migrations: [`${__dirname}/../../migrations/${isConfiguredForMySQL ? 'mysql' : 'sqlite'}/*.js`],
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
