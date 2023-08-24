export interface UpdateTransitionStatusDTO {
  userUuid: string
  status: 'STARTED' | 'FINISHED' | 'FAILED'
}
