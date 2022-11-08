import { Result } from '../Core/Result'

export interface DomainUseCaseInterface<T> {
  execute(...args: any[]): Promise<Result<T>>
}
