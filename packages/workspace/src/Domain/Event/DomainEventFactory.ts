import { DomainEventService, WorkspaceInviteCreatedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'

import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(@inject(TYPES.Timer) private timer: TimerInterface) {}

  createWorkspaceInviteCreatedEvent(dto: {
    inviterUuid: string
    inviteeEmail: string
    inviteUuid: string
    workspaceUuid: string
  }): WorkspaceInviteCreatedEvent {
    return {
      type: 'WORKSPACE_INVITE_CREATED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.inviterUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.Workspace,
      },
      payload: dto,
    }
  }
}
