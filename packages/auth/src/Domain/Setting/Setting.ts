import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { User } from '../User/User'

@Entity({ name: 'settings' })
@Index('index_settings_on_name_and_user_uuid', ['name', 'user'])
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

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
  @Index('index_settings_on_updated_at')
  declare updatedAt: number

  @ManyToOne(
    /* istanbul ignore next */
    () => User,
    /* istanbul ignore next */
    (user) => user.settings,
    /* istanbul ignore next */
    { onDelete: 'CASCADE', nullable: false, lazy: true, eager: false },
  )
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  declare user: Promise<User>

  @Column({
    type: 'tinyint',
    width: 1,
    nullable: false,
    default: 0,
  })
  declare sensitive: boolean
}
