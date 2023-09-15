import { TransitionStatus } from '@standardnotes/domain-core'
import { TransitionStatusRepositoryInterface } from '../../Domain/Transition/TransitionStatusRepositoryInterface'

export class InMemoryTransitionStatusRepository implements TransitionStatusRepositoryInterface {
  private itemStatuses: Map<string, string> = new Map()
  private revisionStatuses: Map<string, string> = new Map()

  async updateStatus(userUuid: string, transitionType: 'items' | 'revisions', status: TransitionStatus): Promise<void> {
    if (transitionType === 'items') {
      this.itemStatuses.set(userUuid, status.value)
    } else {
      this.revisionStatuses.set(userUuid, status.value)
    }
  }

  async remove(userUuid: string, transitionType: 'items' | 'revisions'): Promise<void> {
    if (transitionType === 'items') {
      this.itemStatuses.delete(userUuid)
    } else {
      this.revisionStatuses.delete(userUuid)
    }
  }

  async getStatus(userUuid: string, transitionType: 'items' | 'revisions'): Promise<TransitionStatus | null> {
    let status: string | null

    if (transitionType === 'items') {
      status = this.itemStatuses.get(userUuid) ?? null
    } else {
      status = this.revisionStatuses.get(userUuid) ?? null
    }

    if (status === null) {
      return null
    }

    return TransitionStatus.create(status).getValue()
  }
}
