export type RemoveFileDTO = RemoveUserFileDTO | RemoveVaultFileDTO

export type RemoveUserFileDTO = {
  userUuid: string
  resourceRemoteIdentifier: string
  regularSubscriptionUuid: string
}

export type RemoveVaultFileDTO = {
  vaultUuid: string
  resourceRemoteIdentifier: string
}

export function isRemoveUserFileDTO(dto: RemoveFileDTO): dto is RemoveUserFileDTO {
  return (dto as RemoveUserFileDTO).userUuid !== undefined
}
