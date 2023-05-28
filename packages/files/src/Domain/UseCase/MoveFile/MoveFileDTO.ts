export type MoveFileDTO = MoveFileFromUserToVaultDTO | MoveFileFromVaultToUserDTO

export type MoveFileFromUserToVaultDTO = {
  toVaultUuid: string
  fromUserUuid: string
  resourceRemoteIdentifier: string
  regularSubscriptionUuid: string
}

export type MoveFileFromVaultToUserDTO = {
  fromVaultUuid: string
  toUserUuid: string
  resourceRemoteIdentifier: string
  regularSubscriptionUuid: string
}

export function isMoveFileFromUserToVaultDTO(dto: MoveFileDTO): dto is MoveFileFromUserToVaultDTO {
  return (dto as MoveFileFromUserToVaultDTO).fromUserUuid !== undefined
}
