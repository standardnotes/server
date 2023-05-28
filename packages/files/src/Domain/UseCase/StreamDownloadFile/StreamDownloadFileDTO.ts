export type StreamDownloadFileDTO = StreamDownloadVaultFileDTO | StreamDownloadUserFileDTO

export type StreamDownloadVaultFileDTO = {
  vaultUuid: string
  resourceRemoteIdentifier: string
  startRange: number
  endRange: number
}

export type StreamDownloadUserFileDTO = {
  userUuid: string
  resourceRemoteIdentifier: string
  startRange: number
  endRange: number
}

export function isStreamDownloadFileVaultOwned(dto: StreamDownloadFileDTO): dto is StreamDownloadVaultFileDTO {
  return (dto as StreamDownloadVaultFileDTO).vaultUuid !== undefined
}
