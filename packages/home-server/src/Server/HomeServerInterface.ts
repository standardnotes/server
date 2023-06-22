import { Result } from '@standardnotes/domain-core'
import { HomeServerConfiguration } from './HomeServerConfiguration'

export interface HomeServerInterface {
  start(configuration?: HomeServerConfiguration): Promise<Result<string>>
  activatePremiumFeatures(username: string): Promise<Result<string>>
  stop(): Promise<Result<string>>
  isRunning(): Promise<boolean>
  logs(): NodeJS.ReadableStream | undefined
}
