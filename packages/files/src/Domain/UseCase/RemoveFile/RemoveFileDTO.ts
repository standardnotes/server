export type RemoveFileDTO = RemoveUserFileDTO | RemoveGroupFileDTO

export type RemoveUserFileDTO = {
  userUuid: string
  resourceRemoteIdentifier: string
  regularSubscriptionUuid: string
}

export type RemoveGroupFileDTO = {
  groupUuid: string
  resourceRemoteIdentifier: string
}

export function isRemoveUserFileDTO(dto: RemoveFileDTO): dto is RemoveUserFileDTO {
  return (dto as RemoveUserFileDTO).userUuid !== undefined
}
