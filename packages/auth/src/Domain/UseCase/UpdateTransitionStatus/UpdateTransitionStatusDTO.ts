export interface UpdateTransitionStatusDTO {
  userUuid: string
  transitionType: 'items' | 'revisions'
  status: 'STARTED' | 'FINISHED' | 'FAILED'
}
