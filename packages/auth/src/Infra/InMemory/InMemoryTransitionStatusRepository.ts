import { TransitionStatusRepositoryInterface } from '../../Domain/Transition/TransitionStatusRepositoryInterface'

export class InMemoryTransitionStatusRepository implements TransitionStatusRepositoryInterface {
  private statuses: Map<string, 'STARTED' | 'FAILED'> = new Map()

  async updateStatus(userUuid: string, status: 'STARTED' | 'FAILED'): Promise<void> {
    this.statuses.set(userUuid, status)
  }

  async removeStatus(userUuid: string): Promise<void> {
    this.statuses.delete(userUuid)
  }

  async getStatus(userUuid: string): Promise<'STARTED' | 'FAILED' | null> {
    const status = this.statuses.get(userUuid) || null

    return status
  }
}
