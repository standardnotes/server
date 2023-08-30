import { TransitionStatusRepositoryInterface } from '../../Domain/Transition/TransitionStatusRepositoryInterface'

export class InMemoryTransitionStatusRepository implements TransitionStatusRepositoryInterface {
  private itemStatuses: Map<string, 'STARTED' | 'FAILED'> = new Map()
  private revisionStatuses: Map<string, 'STARTED' | 'FAILED'> = new Map()

  async updateStatus(
    userUuid: string,
    transitionType: 'items' | 'revisions',
    status: 'STARTED' | 'FAILED',
  ): Promise<void> {
    if (transitionType === 'items') {
      this.itemStatuses.set(userUuid, status)
    } else {
      this.revisionStatuses.set(userUuid, status)
    }
  }

  async removeStatus(userUuid: string, transitionType: 'items' | 'revisions'): Promise<void> {
    if (transitionType === 'items') {
      this.itemStatuses.delete(userUuid)
    } else {
      this.revisionStatuses.delete(userUuid)
    }
  }

  async getStatus(userUuid: string, transitionType: 'items' | 'revisions'): Promise<'STARTED' | 'FAILED' | null> {
    let status: 'STARTED' | 'FAILED' | null = null

    if (transitionType === 'items') {
      status = this.itemStatuses.get(userUuid) ?? null
    } else {
      status = this.revisionStatuses.get(userUuid) ?? null
    }

    return status
  }
}
