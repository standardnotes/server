import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { WorkspaceType } from './WorkspaceType'

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
}
