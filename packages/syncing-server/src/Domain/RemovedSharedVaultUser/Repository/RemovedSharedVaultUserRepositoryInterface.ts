import { RemovedSharedVaultUser } from '../Model/RemovedSharedVaultUser'

export type RemovedSharedVaultUserFindAllForUserQuery = {
  userUuid: string
}

export interface RemovedSharedVaultUserRepositoryInterface {
  create(sharedVault: RemovedSharedVaultUser): Promise<RemovedSharedVaultUser>
  remove(sharedVault: RemovedSharedVaultUser): Promise<RemovedSharedVaultUser>
  findAllForUser(query: RemovedSharedVaultUserFindAllForUserQuery): Promise<RemovedSharedVaultUser[]>
  findByUserUuidAndSharedVaultUuid(userUuid: string, sharedVaultUuid: string): Promise<RemovedSharedVaultUser | null>
}
