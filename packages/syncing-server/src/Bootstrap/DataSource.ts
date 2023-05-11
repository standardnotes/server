import { ItemShare } from '../Domain/ItemShare/Model/ItemShare'
import { DataSource, LoggerOptions } from 'typeorm'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'
import { Item } from '../Domain/Item/Item'
import { Env } from './Env'
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'

const env: Env = new Env()
env.load()

const isConfiguredForMySQL = env.get('DB_TYPE') === 'mysql'

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

const commonDataSourceOptions = {
  maxQueryExecutionTime,
  entities: [Item, ItemShare],
  migrations: [`dist/migrations/${isConfiguredForMySQL ? 'mysql' : 'sqlite'}/*.js`],
  migrationsRun: true,
  logging: <LoggerOptions>env.get('DB_DEBUG_LEVEL'),
}

const mySQLDataSourceOptions: MysqlConnectionOptions = {
  ...commonDataSourceOptions,
  type: 'mysql',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: false,
  replication: inReplicaMode ? replicationConfig : undefined,
  host: inReplicaMode ? undefined : env.get('DB_HOST'),
  port: inReplicaMode ? undefined : parseInt(env.get('DB_PORT')),
  username: inReplicaMode ? undefined : env.get('DB_USERNAME'),
  password: inReplicaMode ? undefined : env.get('DB_PASSWORD'),
  database: inReplicaMode ? undefined : env.get('DB_DATABASE'),
}

const sqliteDataSourceOptions: SqliteConnectionOptions = {
  ...commonDataSourceOptions,
  type: 'sqlite',
  database: `data/${env.get('DB_DATABASE')}.sqlite`,
}

export const AppDataSource = new DataSource(isConfiguredForMySQL ? mySQLDataSourceOptions : sqliteDataSourceOptions)
