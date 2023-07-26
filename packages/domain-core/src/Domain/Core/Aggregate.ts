/* istanbul ignore file */

import { Change } from './Change'
import { Entity } from './Entity'

export abstract class Aggregate<T> extends Entity<T> {
  private changesOnAggregateRoot: Change[] = []

  addChange(change: Change): void {
    this.changesOnAggregateRoot.push(change)
  }

  flushChanges(): void {
    this.changesOnAggregateRoot = []
  }

  getChanges(): Change[] {
    return this.changesOnAggregateRoot
  }
}
