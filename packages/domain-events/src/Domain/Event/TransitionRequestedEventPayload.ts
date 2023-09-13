export interface TransitionRequestedEventPayload {
  userUuid: string
  type: 'items' | 'revisions'
  timestamp: number
}
