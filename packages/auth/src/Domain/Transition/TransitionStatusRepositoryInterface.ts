import { TransitionStatus } from '@standardnotes/domain-core'

export interface TransitionStatusRepositoryInterface {
  updateStatus(userUuid: string, transitionType: 'items' | 'revisions', status: TransitionStatus): Promise<void>
  getStatus(userUuid: string, transitionType: 'items' | 'revisions'): Promise<TransitionStatus | null>
  remove(userUuid: string, transitionType: 'items' | 'revisions'): Promise<void>
}
