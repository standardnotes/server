import { SharedVault } from './SharedVault'

export interface SharedVaultsRepositoryInterface {
  findByUuid(uuid: string): Promise<SharedVault | null>
  save(sharedVault: SharedVault): Promise<void>
  remove(sharedVault: SharedVault): Promise<void>
}
