import { AsymmetricMessage } from '../Model/AsymmetricMessage'

export type AsymmetricMessageQuery = {
  userUuid: string
}

export type AsymmetricMessageFindAllForUserQuery = {
  userUuid?: string
  lastSyncTime?: number
  senderUuid?: string
}

export interface AsymmetricMessageRepositoryInterface {
  findByUuid(asymmetricMessageUuid: string): Promise<AsymmetricMessage | null>
  create(sharedVault: AsymmetricMessage): Promise<AsymmetricMessage>
  save(asymmetricMessage: AsymmetricMessage): Promise<AsymmetricMessage>
  remove(sharedVault: AsymmetricMessage): Promise<AsymmetricMessage>
  findAll(query: AsymmetricMessageFindAllForUserQuery): Promise<AsymmetricMessage[]>
}
