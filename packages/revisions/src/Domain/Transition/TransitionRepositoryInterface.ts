export interface TransitionRepositoryInterface {
  getPagingProgress(userUuid: string): Promise<number>
  setPagingProgress(userUuid: string, progress: number): Promise<void>
  getIntegrityProgress(userUuid: string): Promise<number>
  setIntegrityProgress(userUuid: string, progress: number): Promise<void>
}
