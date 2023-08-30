export interface TransitionStatusRepositoryInterface {
  updateStatus(userUuid: string, transitionType: 'items' | 'revisions', status: 'STARTED' | 'FAILED'): Promise<void>
  removeStatus(userUuid: string, transitionType: 'items' | 'revisions'): Promise<void>
  getStatus(userUuid: string, transitionType: 'items' | 'revisions'): Promise<'STARTED' | 'FAILED' | null>
}
