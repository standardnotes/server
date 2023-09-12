export interface TransitionStatusRepositoryInterface {
  updateStatus(
    userUuid: string,
    transitionType: 'items' | 'revisions',
    status: 'STARTED' | 'IN_PROGRESS' | 'FAILED',
  ): Promise<void>
  removeStatus(userUuid: string, transitionType: 'items' | 'revisions'): Promise<void>
  getStatus(
    userUuid: string,
    transitionType: 'items' | 'revisions',
  ): Promise<'STARTED' | 'IN_PROGRESS' | 'FAILED' | null>
  getStatuses(
    transitionType: 'items' | 'revisions',
  ): Promise<Array<{ userUuid: string; status: 'STARTED' | 'IN_PROGRESS' | 'FAILED' }>>
}
