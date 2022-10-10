import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { WorkspaceAccessLevel } from './WorkspaceAccessLevel'
import { WorkspaceUserStatus } from './WorkspaceUserStatus'

@Entity({ name: 'workspace_users' })
@Index('index_workspace_users_on_workspace_and_user', ['userUuid', 'workspaceUuid'], { unique: true })
export class WorkspaceUser {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'access_level',
    length: 64,
  })
  declare accessLevel: WorkspaceAccessLevel

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  declare userUuid: string

  @Column({
    name: 'workspace_uuid',
    length: 36,
  })
  declare workspaceUuid: string

  @Column({
    name: 'encrypted_workspace_key',
    length: 255,
    type: 'varchar',
    nullable: true,
  })
  declare encryptedWorkspaceKey: string | null

  @Column({
    name: 'public_key',
    length: 255,
    type: 'varchar',
  })
  declare publicKey: string

  @Column({
    name: 'encrypted_private_key',
    length: 255,
    type: 'varchar',
  })
  declare encryptedPrivateKey: string

  @Column({
    name: 'status',
    length: 64,
  })
  declare status: WorkspaceUserStatus

  @Column({
    name: 'key_rotation_index',
    default: 0,
  })
  declare keyRotationIndex: number
}
