/* istanbul ignore file */

// Uses Node's built-in randomUUID so that consumers don't inherit a uuid dependency
import { randomUUID } from 'node:crypto'
import { Id } from './Id'

export class UniqueEntityId extends Id<string | number> {
  constructor(id?: string | number) {
    super(id ? id : randomUUID())
  }
}
