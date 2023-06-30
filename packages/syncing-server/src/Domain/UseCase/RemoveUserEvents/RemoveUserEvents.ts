import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import { RemoveUserEventsDTO } from './RemoveUserEventsDTO'

export class RemoveUserEvents implements UseCaseInterface<void> {
  async execute(_dto: RemoveUserEventsDTO): Promise<Result<void>> {
    throw new Error('Method not implemented.')
  }
}
