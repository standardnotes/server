/* istanbul ignore file */

import { Uuid } from '@standardnotes/domain-core'
import { DomainEventHandlerInterface, RevisionsOwnershipUpdateRequestedEvent } from '@standardnotes/domain-events'
import { RevisionRepositoryInterface } from '../Revision/RevisionRepositoryInterface'

export class RevisionsOwnershipUpdateRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(private revisionRepository: RevisionRepositoryInterface) {}

  async handle(event: RevisionsOwnershipUpdateRequestedEvent): Promise<void> {
    const userUuidOrError = Uuid.create(event.payload.userUuid)
    if (userUuidOrError.isFailed()) {
      return
    }
    const userUuid = userUuidOrError.getValue()

    const itemUuidOrError = Uuid.create(event.payload.itemUuid)
    if (itemUuidOrError.isFailed()) {
      return
    }
    const itemUuid = itemUuidOrError.getValue()

    await this.revisionRepository.updateUserUuid(itemUuid, userUuid)
  }
}
