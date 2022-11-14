import { Aggregate, UniqueEntityId, Result } from '@standardnotes/domain-core'

import { RevenueModificationProps } from './RevenueModificationProps'

export class RevenueModification extends Aggregate<RevenueModificationProps> {
  private constructor(props: RevenueModificationProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: RevenueModificationProps, id?: UniqueEntityId): Result<RevenueModification> {
    return Result.ok<RevenueModification>(new RevenueModification(props, id))
  }
}
