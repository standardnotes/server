import { config, DotenvParseOutput } from 'dotenv'

export class Env {
  private env?: DotenvParseOutput

  public load(): void {
    const output = config()
    this.env = <DotenvParseOutput>output.parsed
  }

  public get(key: string, optional = false): string {
    if (!this.env) {
      this.load()
    }

    if (!process.env[key] && !optional) {
      throw new Error(`Environment variable ${key} not set`)
    }

    return <string>process.env[key]
  }
}
