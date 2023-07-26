/* istanbul ignore file */

import { Entity } from './Entity'

export interface ChangeProps {
  aggregateRootUuid: string
  changeType: string
  changeData: Entity<unknown>
}
