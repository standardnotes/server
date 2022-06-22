export interface UseCaseInterface {
  execute(...args: any[]): Promise<Record<string, unknown>>
}
