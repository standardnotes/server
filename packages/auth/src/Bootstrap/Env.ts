import { AbstractEnv } from '@standardnotes/domain-core'
import { config, DotenvParseOutput } from 'dotenv'

export class Env extends AbstractEnv {
  load(): void {
    const output = config()
    this.env = <DotenvParseOutput>output.parsed
  }
}
