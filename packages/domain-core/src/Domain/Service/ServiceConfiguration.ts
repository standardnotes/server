import { Transform } from 'stream'

export interface ServiceConfiguration {
  logger?: Transform
  environmentOverrides?: { [name: string]: string }
}
