/* istanbul ignore file */

import { v4 as uuid } from 'uuid'
import { Id } from './Id'

export class UniqueEntityId extends Id<string | number> {
  constructor(id?: string | number) {
    super(id ? id : uuid())
  }
}
