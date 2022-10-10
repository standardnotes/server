import { ProtocolVersion, WorkspaceType } from '@standardnotes/common'
import { DomainEventHandlerInterface, UserRegisteredEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { CreateWorkspace } from '../UseCase/CreateWorkspace/CreateWorkspace'

@injectable()
export class UserRegisteredEventHandler implements DomainEventHandlerInterface {
  constructor(@inject(TYPES.CreateWorkspace) private createWorkspace: CreateWorkspace) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    if (event.payload.protocolVersion !== ProtocolVersion.V005) {
      return
    }

    await this.createWorkspace.execute({
      ownerUuid: event.payload.userUuid,
      type: WorkspaceType.Root,
    })
  }
}
