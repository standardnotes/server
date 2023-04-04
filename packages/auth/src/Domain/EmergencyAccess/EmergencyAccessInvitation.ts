import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { EmergencyAccessInvitationProps } from './EmergencyAccessInvitationProps'

export class EmergencyAccessInvitation extends Entity<EmergencyAccessInvitationProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: EmergencyAccessInvitationProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: EmergencyAccessInvitationProps, id?: UniqueEntityId): Result<EmergencyAccessInvitation> {
    return Result.ok<EmergencyAccessInvitation>(new EmergencyAccessInvitation(props, id))
  }
}
