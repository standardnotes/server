export interface TransitionStatusRepositoryInterface {
  updateStatus(
    userUuid: string,
    transitionType: 'items' | 'revisions',
    status: 'STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'FAILED' | 'VERIFIED',
  ): Promise<void>
  getStatus(
    userUuid: string,
    transitionType: 'items' | 'revisions',
  ): Promise<'STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'FAILED' | 'VERIFIED' | null>
}
