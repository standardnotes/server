import { SharedVaultInvite } from '../Model/SharedVaultInvite'
import { SharedVaultInviteHash } from './SharedVaultInviteHash'

export interface SharedVaultInviteFactoryInterface {
  create(dto: SharedVaultInviteHash): SharedVaultInvite
  createStub(dto: SharedVaultInviteHash): SharedVaultInvite
}
