import { MapperInterface } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'
import { Logger } from 'winston'

import { Revision } from '../../../Domain/Revision/Revision'
import { RevisionMetadata } from '../../../Domain/Revision/RevisionMetadata'
import { SQLLegacyRevisionRepository } from './SQLLegacyRevisionRepository'
import { SQLRevision } from './SQLRevision'

export class SQLRevisionRepository extends SQLLegacyRevisionRepository {
  constructor(
    protected override ormRepository: Repository<SQLRevision>,
    protected override revisionMetadataMapper: MapperInterface<RevisionMetadata, SQLRevision>,
    protected override revisionMapper: MapperInterface<Revision, SQLRevision>,
    protected override logger: Logger,
  ) {
    super(ormRepository, revisionMetadataMapper, revisionMapper, logger)
  }
}
