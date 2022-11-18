import { Result } from '../Core/Result'

export interface UseCaseInterface<T> {
  execute(...args: any[]): Promise<Result<T>>
}
