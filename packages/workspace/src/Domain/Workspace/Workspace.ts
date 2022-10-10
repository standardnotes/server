import { WorkspaceType } from '@standardnotes/common'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { WorkspaceInvite } from '../Invite/WorkspaceInvite'

@Entity({ name: 'workspaces' })
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    length: 64,
  })
  declare type: WorkspaceType

  @Column({
    length: 255,
    nullable: true,
    type: 'varchar',
  })
  declare name: string | null

  @Column({
    name: 'key_rotation_index',
    default: 0,
  })
  declare keyRotationIndex: number

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

  @OneToMany(
    /* istanbul ignore next */
    () => WorkspaceInvite,
    /* istanbul ignore next */
    (workspaceInvite) => workspaceInvite.workspace,
  )
  declare invites: Promise<WorkspaceInvite[]>
}
