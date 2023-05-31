import { DomainEventHandlerInterface, GroupFileRemovedEvent } from '@standardnotes/domain-events'

import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { GroupServiceInterface } from '../Group/Service/GroupServiceInterface'
import { GroupsRepositoryInterface } from '../Group/Repository/GroupRepositoryInterface'

@injectable()
export class GroupFileRemovedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GroupService) private groupService: GroupServiceInterface,
    @inject(TYPES.GroupRepository) private groupRepository: GroupsRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: GroupFileRemovedEvent): Promise<void> {
    const group = await this.groupService.getGroup({
      groupUuid: event.payload.groupUuid,
    })

    if (group === null) {
      this.logger.warn(`Could not find group with uuid: ${event.payload.groupUuid}`)

      return
    }

    group.fileUploadBytesUsed -= event.payload.fileByteSize

    await this.groupRepository.save(group)
  }
}
