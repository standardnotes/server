import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'

@Entity({ name: 'offline_settings' })
@Index('index_offline_settings_on_name_and_email', ['name', 'email'])
export class OfflineSetting {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    length: 255,
  })
  declare email: string

  @Column({
    length: 255,
  })
  declare name: string

  @Column({
    type: 'text',
    nullable: true,
  })
  declare value: string | null

  @Column({
    name: 'server_encryption_version',
    type: 'tinyint',
    default: EncryptionVersion.Unencrypted,
  })
  declare serverEncryptionVersion: number

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
}
