export interface TransitionStatusUpdatedEventPayload {
  userUuid: string
  transitionType: 'items' | 'revisions'
  status: 'STARTED' | 'FINISHED' | 'FAILED'
}
