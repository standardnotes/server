import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../../Domain/User/User'

@Entity({ name: 'emergency_access_invitations' })
export class TypeORMEmergencyAccessInvitation {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'grantor_uuid',
    length: 36,
  })
  declare grantorUuid: string

  @ManyToOne(
    /* istanbul ignore next */
    () => User,
    /* istanbul ignore next */
    (user) => user.emergencyAccessInvitationsCreated,
    /* istanbul ignore next */
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'grantor_uuid', referencedColumnName: 'uuid', foreignKeyConstraintName: 'grantor_uuid_fk' })
  declare grantor: Promise<User>

  @Column({
    name: 'grantee_email',
    length: 255,
  })
  declare granteeEmail: string

  @Column({
    name: 'grantee_uuid',
    length: 36,
    type: 'varchar',
    nullable: true,
  })
  declare granteeUuid: string | null

  @ManyToOne(
    /* istanbul ignore next */
    () => User,
    /* istanbul ignore next */
    (user) => user.emergencyAccessInvitationsReceived,
    /* istanbul ignore next */
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'grantee_uuid', referencedColumnName: 'uuid', foreignKeyConstraintName: 'grantee_uuid_fk' })
  declare grantee: Promise<User | null>

  @Column({
    name: 'status',
    length: 36,
  })
  declare status: string

  @Column({
    name: 'expires_at',
    type: 'datetime',
  })
  declare expiresAt: Date

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
}
