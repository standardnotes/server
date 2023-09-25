export interface TransitionRepositoryInterface {
  getPagingProgress(userUuid: string): Promise<number>
  setPagingProgress(userUuid: string, progress: number): Promise<void>
}
