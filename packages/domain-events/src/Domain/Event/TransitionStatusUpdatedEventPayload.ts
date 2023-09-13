export interface TransitionStatusUpdatedEventPayload {
  userUuid: string
  transitionType: 'items' | 'revisions'
  transitionTimestamp: number
  status: 'STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'FAILED'
}
