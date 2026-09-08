/* istanbul ignore file */

import { randomUUID } from 'node:crypto'
import { Id } from './Id'

export class UniqueEntityId extends Id<string | number> {
  constructor(id?: string | number) {
    super(id ? id : randomUUID())
  }
}
