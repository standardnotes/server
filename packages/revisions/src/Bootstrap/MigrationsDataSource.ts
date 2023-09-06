import { AppDataSource } from './DataSource'
import { Env } from './Env'

const env: Env = new Env()
env.load()

export const MigrationsDataSource = new AppDataSource(env).dataSource
