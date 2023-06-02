export abstract class AbstractEnv {
  protected env?: { [key: string]: string } = {}
  protected overrides: { [key: string]: string }

  constructor(overrides: { [key: string]: string } = {}) {
    this.overrides = overrides
  }

  abstract load(): void

  get(key: string, optional = false): string {
    if (!this.env) {
      this.load()
    }

    if (this.overrides[key]) {
      return this.overrides[key]
    }

    if (!process.env[key] && !optional) {
      throw new Error(`Environment variable ${key} not set`)
    }

    return <string>process.env[key]
  }
}
