export interface TransitionStatusUpdatedEventPayload {
  userUuid: string
  transitionType: 'items' | 'revisions'
  transitionTimestamp: number
  status: string
}
