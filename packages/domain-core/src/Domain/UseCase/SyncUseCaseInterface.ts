import { Result } from '../Core/Result'

export interface SyncUseCaseInterface<T> {
  execute(...args: any[]): Result<T>
}
