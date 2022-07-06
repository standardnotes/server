/* istanbul ignore file */
import { PredicateAuthority, PredicateName } from '@standardnotes/predicates'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Job } from '../Job/Job'
import { PredicateStatus } from './PredicateStatus'

@Entity({ name: 'predicates' })
export class Predicate {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    type: 'varchar',
    length: 255,
  })
  declare name: PredicateName

  @Column({
    type: 'varchar',
    length: 255,
  })
  declare authority: PredicateAuthority

  @Column({
    type: 'varchar',
    length: 32,
  })
  declare status: PredicateStatus

  @ManyToOne(
    /* istanbul ignore next */
    () => Job,
    /* istanbul ignore next */
    (job) => job.predicates,
    { onDelete: 'CASCADE', lazy: true, eager: false },
  )
  @JoinColumn({ name: 'job_uuid', referencedColumnName: 'uuid' })
  declare job: Promise<Job>
}
