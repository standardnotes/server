export interface UpdateTransitionStatusDTO {
  userUuid: string
  transitionType: 'items' | 'revisions'
  transitionTimestamp: number
  status: string
}
