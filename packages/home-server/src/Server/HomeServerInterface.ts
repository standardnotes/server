import { HomeServerConfiguration } from './HomeServerConfiguration'

export interface HomeServerInterface {
  start(configuration?: HomeServerConfiguration): Promise<void>
  stop(): Promise<void>
  isRunning(): Promise<boolean>
  logs(): NodeJS.ReadableStream
}
