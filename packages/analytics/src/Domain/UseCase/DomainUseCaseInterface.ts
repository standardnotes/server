import { Result } from '@standardnotes/domain-core'

export interface DomainUseCaseInterface<T> {
  execute(...args: any[]): Promise<Result<T>>
}
