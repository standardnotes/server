import { VaultInvite } from '../Model/VaultInvite'
import { VaultInviteHash } from './VaultInviteHash'

export interface VaultInviteFactoryInterface {
  create(dto: VaultInviteHash): VaultInvite
  createStub(dto: VaultInviteHash): VaultInvite
}
