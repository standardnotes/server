import { WorkspaceAccessLevel } from '@standardnotes/common'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Workspace } from '../Workspace/Workspace'
import { WorkspaceInviteStatus } from './WorkspaceInviteStatus'

@Entity({ name: 'workspace_invites' })
export class WorkspaceInvite {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'inviter_uuid',
    length: 36,
  })
  declare inviterUuid: string

  @Column({
    name: 'invitee_email',
    length: 255,
  })
  declare inviteeEmail: string

  @Column({
    name: 'status',
    type: 'varchar',
    length: 64,
  })
  declare status: WorkspaceInviteStatus

  @Column({
    name: 'accepting_user_uuid',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  declare acceptingUserUuid: string | null

  @Column({
    name: 'workspace_uuid',
    length: 36,
  })
  declare workspaceUuid: string

  @Column({
    name: 'access_level',
    length: 64,
  })
  declare accessLevel: WorkspaceAccessLevel

  @Column({
    name: 'created_at',
    type: 'bigint',
  })
  declare createdAt: number

  @Column({
    name: 'updated_at',
    type: 'bigint',
  })
  declare updatedAt: number

  @ManyToOne(
    /* istanbul ignore next */
    () => Workspace,
    /* istanbul ignore next */
    (workspace) => workspace.invites,
    /* istanbul ignore next */
    { onDelete: 'CASCADE' },
  )
  @JoinColumn(
    /* istanbul ignore next */
    { name: 'workspace_uuid' },
  )
  declare workspace: Promise<Workspace>
}
