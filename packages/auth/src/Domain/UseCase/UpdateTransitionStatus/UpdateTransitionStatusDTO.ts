export interface UpdateTransitionStatusDTO {
  userUuid: string
  transitionType: 'items' | 'revisions'
  status: 'STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'FAILED'
}
