import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { RevokedSession } from '../Session/RevokedSession'
import { Role } from '../Role/Role'
import { ProtocolVersion } from '@standardnotes/common'
import { TypeORMEmergencyAccessInvitation } from '../../Infra/TypeORM/TypeORMEmergencyAccessInvitation'

@Entity({ name: 'users' })
export class User {
  static readonly PASSWORD_HASH_COST = 11
  static readonly DEFAULT_ENCRYPTION_VERSION = 1

  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    length: 255,
    nullable: true,
  })
  declare version: string

  @Column({
    length: 255,
    nullable: true,
  })
  @Index('index_users_on_email')
  declare email: string

  @Column({
    name: 'pw_nonce',
    length: 255,
    nullable: true,
  })
  declare pwNonce: string

  @Column({
    name: 'encrypted_server_key',
    length: 255,
    type: 'varchar',
    nullable: true,
  })
  declare encryptedServerKey: string | null

  @Column({
    name: 'server_encryption_version',
    type: 'tinyint',
    default: 0,
  })
  declare serverEncryptionVersion: number

  @Column({
    name: 'kp_created',
    length: 255,
    nullable: true,
  })
  declare kpCreated: string

  @Column({
    name: 'kp_origination',
    length: 255,
    nullable: true,
  })
  declare kpOrigination: string

  @Column({
    name: 'pw_cost',
    width: 11,
    type: 'int',
    nullable: true,
  })
  declare pwCost: number

  @Column({
    name: 'pw_key_size',
    width: 11,
    type: 'int',
    nullable: true,
  })
  declare pwKeySize: number

  @Column({
    name: 'pw_salt',
    length: 255,
    nullable: true,
  })
  declare pwSalt: string

  @Column({
    name: 'pw_alg',
    length: 255,
    nullable: true,
  })
  declare pwAlg: string

  @Column({
    name: 'pw_func',
    length: 255,
    nullable: true,
  })
  declare pwFunc: string

  @Column({
    name: 'encrypted_password',
    length: 255,
  })
  declare encryptedPassword: string

  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  declare createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
  })
  declare updatedAt: Date

  @Column({
    name: 'locked_until',
    type: 'datetime',
    nullable: true,
  })
  declare lockedUntil: Date | null

  @Column({
    name: 'num_failed_attempts',
    type: 'int',
    width: 11,
    nullable: true,
  })
  declare numberOfFailedAttempts: number | null

  @OneToMany(
    /* istanbul ignore next */
    () => RevokedSession,
    /* istanbul ignore next */
    (revokedSession) => revokedSession.user,
    /* istanbul ignore next */
    { lazy: true, eager: false },
  )
  declare revokedSessions: Promise<RevokedSession[]>

  @ManyToMany(
    /* istanbul ignore next */
    () => Role,
    /* istanbul ignore next */
    { lazy: true, eager: false },
  )
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'role_uuid',
      referencedColumnName: 'uuid',
    },
  })
  declare roles: Promise<Array<Role>>

  @OneToMany(
    /* istanbul ignore next */
    () => TypeORMEmergencyAccessInvitation,
    /* istanbul ignore next */
    (invitation) => invitation.grantor,
  )
  declare emergencyAccessInvitationsCreated: Promise<TypeORMEmergencyAccessInvitation[]>

  @OneToMany(
    /* istanbul ignore next */
    () => TypeORMEmergencyAccessInvitation,
    /* istanbul ignore next */
    (invitation) => invitation.grantee,
  )
  declare emergencyAccessInvitationsReceived: Promise<TypeORMEmergencyAccessInvitation[]>

  supportsSessions(): boolean {
    return parseInt(this.version) >= parseInt(ProtocolVersion.V004)
  }

  isPotentiallyAPrivateUsernameAccount(): boolean {
    return this.email.length === 64 && !this.email.includes('@')
  }
}
