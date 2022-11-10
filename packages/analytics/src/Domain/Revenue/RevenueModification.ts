import { Aggregate } from '../Core/Aggregate'
import { Result } from '../Core/Result'
import { UniqueEntityId } from '../Core/UniqueEntityId'
import { RevenueModificationProps } from './RevenueModificationProps'

export class RevenueModification extends Aggregate<RevenueModificationProps> {
  private constructor(props: RevenueModificationProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: RevenueModificationProps, id?: UniqueEntityId): Result<RevenueModification> {
    return Result.ok<RevenueModification>(new RevenueModification(props, id))
  }
}
