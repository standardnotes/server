/* istanbul ignore file */

import { ChangeProps } from './ChangeProps'
import { Result } from './Result'

export class Change {
  static readonly TYPES = {
    Add: 'add',
    Remove: 'remove',
    Modify: 'modify',
  }

  public readonly props: ChangeProps

  constructor(props: ChangeProps) {
    this.props = Object.freeze(props)
  }

  static create(props: ChangeProps): Result<Change> {
    if (!Object.values(Change.TYPES).includes(props.changeType)) {
      return Result.fail('Invalid change type')
    }

    return Result.ok(new Change(props))
  }
}
