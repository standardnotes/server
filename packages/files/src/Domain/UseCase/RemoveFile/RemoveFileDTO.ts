export type RemoveFileDTO = RemoveUserFileDTO | RemoveSharedVaultFileDTO

export type RemoveUserFileDTO = {
  userUuid: string
  resourceRemoteIdentifier: string
  regularSubscriptionUuid: string
}

export type RemoveSharedVaultFileDTO = {
  sharedVaultUuid: string
  resourceRemoteIdentifier: string
}

export function isRemoveUserFileDTO(dto: RemoveFileDTO): dto is RemoveUserFileDTO {
  return (dto as RemoveUserFileDTO).userUuid !== undefined
}
