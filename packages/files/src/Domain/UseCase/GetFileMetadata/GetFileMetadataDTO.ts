export type GetFileMetadataDTO = GetVaultFileMetadataDTO | GetUserFileMetadataDTO

export type GetVaultFileMetadataDTO = {
  vaultUuid: string
  resourceRemoteIdentifier: string
}

export type GetUserFileMetadataDTO = {
  userUuid: string
  resourceRemoteIdentifier: string
}

export function isGetFileMetadataVaultOwned(dto: GetFileMetadataDTO): dto is GetVaultFileMetadataDTO {
  return (dto as GetVaultFileMetadataDTO).vaultUuid !== undefined
}
