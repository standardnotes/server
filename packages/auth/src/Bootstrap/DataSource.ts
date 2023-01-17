import { DataSource, LoggerOptions } from 'typeorm'
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
import { TypeORMSessionTrace } from '../Infra/TypeORM/TypeORMSessionTrace'
import { Env } from './Env'

const env: Env = new Env()
env.load()

const maxQueryExecutionTime = env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
  ? +env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
  : 45_000

const inReplicaMode = env.get('DB_REPLICA_HOST', true) ? true : false

const replicationConfig = {
  master: {
    host: env.get('DB_HOST'),
    port: parseInt(env.get('DB_PORT')),
    username: env.get('DB_USERNAME'),
    password: env.get('DB_PASSWORD'),
    database: env.get('DB_DATABASE'),
  },
  slaves: [
    {
      host: env.get('DB_REPLICA_HOST', true),
      port: parseInt(env.get('DB_PORT')),
      username: env.get('DB_USERNAME'),
      password: env.get('DB_PASSWORD'),
      database: env.get('DB_DATABASE'),
    },
  ],
  removeNodeErrorCount: 10,
  restoreNodeTimeout: 5,
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: false,
  maxQueryExecutionTime,
  replication: inReplicaMode ? replicationConfig : undefined,
  host: inReplicaMode ? undefined : env.get('DB_HOST'),
  port: inReplicaMode ? undefined : parseInt(env.get('DB_PORT')),
  username: inReplicaMode ? undefined : env.get('DB_USERNAME'),
  password: inReplicaMode ? undefined : env.get('DB_PASSWORD'),
  database: inReplicaMode ? undefined : env.get('DB_DATABASE'),
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
  ],
  migrations: [env.get('DB_MIGRATIONS_PATH', true) ?? 'dist/migrations/*.js'],
  migrationsRun: true,
  logging: <LoggerOptions>env.get('DB_DEBUG_LEVEL'),
})
