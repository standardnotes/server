import { RemovedVaultUser } from '../Model/RemovedVaultUser'

export type RemovedVaultUserFindAllForUserQuery = {
  userUuid: string
}

export interface RemovedVaultUserRepositoryInterface {
  create(vault: RemovedVaultUser): Promise<RemovedVaultUser>
  remove(vault: RemovedVaultUser): Promise<RemovedVaultUser>
  findAllForUser(query: RemovedVaultUserFindAllForUserQuery): Promise<RemovedVaultUser[]>
  findByUserUuidAndVaultUuid(userUuid: string, vaultUuid: string): Promise<RemovedVaultUser | null>
}
