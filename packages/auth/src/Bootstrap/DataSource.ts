import { DataSource, EntityTarget, LoggerOptions, ObjectLiteral, Repository } from 'typeorm'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'
import { Permission } from '../Domain/Permission/Permission'
import { Role } from '../Domain/Role/Role'
import { RevokedSession } from '../Domain/Session/RevokedSession'
import { Session } from '../Domain/Session/Session'
import { OfflineSetting } from '../Domain/Setting/OfflineSetting'
import { Setting } from '../Domain/Setting/Setting'
import { SubscriptionSetting } from '../Domain/Setting/SubscriptionSetting'
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

export class AppDataSource {
  private _dataSource: DataSource | undefined

  constructor(private env: Env) {}

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
    this.env.load()

    const isConfiguredForMySQL = this.env.get('DB_TYPE') === 'mysql'

    const maxQueryExecutionTime = this.env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
      ? +this.env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
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
        Setting,
        OfflineSetting,
        SharedSubscriptionInvitation,
        SubscriptionSetting,
        TypeORMSessionTrace,
        TypeORMAuthenticator,
        TypeORMAuthenticatorChallenge,
        TypeORMEmergencyAccessInvitation,
        TypeORMCacheEntry,
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
      }

      this._dataSource = new DataSource(sqliteDataSourceOptions)
    }

    return this._dataSource
  }
}
