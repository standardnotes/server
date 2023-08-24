export interface TransitionStatusUpdatedEventPayload {
  userUuid: string
  status: 'STARTED' | 'FINISHED' | 'FAILED'
}
