import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'shared_vaults' })
export class TypeORMSharedVault {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('user_uuid_on_shared_vaults')
  declare userUuid: string

  @Column({
    name: 'file_upload_bytes_used',
    type: 'int',
  })
  declare fileUploadBytesUsed: number

  @Column({
    name: 'file_upload_bytes_limit',
    type: 'int',
  })
  declare fileUploadBytesLimit: number

  @Column({
    name: 'created_at_timestamp',
    type: 'bigint',
  })
  declare createdAtTimestamp: number

  @Column({
    name: 'updated_at_timestamp',
    type: 'bigint',
  })
  declare updatedAtTimestamp: number
}
