import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'vaults' })
export class Vault {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('index_vaults_on_user_uuid')
  declare userUuid: string

  @Column({
    name: 'specified_items_key_uuid',
    length: 36,
  })
  declare specifiedItemsKeyUuid: string

  @Column({
    name: 'file_upload_bytes_used',
    type: 'bigint',
  })
  declare fileUploadBytesUsed: number

  @Column({
    name: 'file_upload_bytes_limit',
    type: 'bigint',
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
