export class SimpleContainer {
  private services: Map<symbol, unknown> = new Map()

  constructor() {
    this.services = new Map()
  }

  public get<T>(key: symbol): T {
    if (!this.services.has(key)) {
      throw new Error(`Service ${key.toString()} not found`)
    }

    return this.services.get(key) as T
  }

  public set(key: symbol, value: unknown): void {
    this.services.set(key, value)
  }
}
