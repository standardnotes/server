export interface UpdateTransitionStatusDTO {
  userUuid: string
  transitionType: 'items' | 'revisions'
  transitionTimestamp: number
  status: 'STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'FAILED'
}
