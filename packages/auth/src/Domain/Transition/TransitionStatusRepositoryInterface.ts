export interface TransitionStatusRepositoryInterface {
  updateStatus(userUuid: string, status: 'STARTED' | 'FAILED'): Promise<void>
  removeStatus(userUuid: string): Promise<void>
  getStatus(userUuid: string): Promise<'STARTED' | 'FAILED' | null>
}
