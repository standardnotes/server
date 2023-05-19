import { GroupInvite } from '../Model/GroupInvite'

export type GroupInviteQuery = {
  userUuid: string
}

export type GroupInviteFindAllForUserQuery = {
  userUuid: string
  lastSyncTime?: number
  inviterUuid?: string
  includeSentAndReceived?: boolean
}

export type GroupInviteFindAllForGroup = {
  groupUuid: string
}

export interface GroupInviteRepositoryInterface {
  findByUuid(groupInviteUuid: string): Promise<GroupInvite | null>
  create(group: GroupInvite): Promise<GroupInvite>
  save(groupInvite: GroupInvite): Promise<GroupInvite>
  remove(group: GroupInvite): Promise<GroupInvite>
  findAllForUser(query: GroupInviteFindAllForUserQuery): Promise<GroupInvite[]>
  findAllForGroup(query: GroupInviteFindAllForGroup): Promise<GroupInvite[]>
  findByUserUuidAndGroupUuid(userUuid: string, groupUuid: string): Promise<GroupInvite | null>
}
