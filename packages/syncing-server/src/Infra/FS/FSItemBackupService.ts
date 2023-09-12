import { KeyParamsData } from '@standardnotes/responses'
import { MapperInterface } from '@standardnotes/domain-core'
import { promises } from 'fs'
import * as uuid from 'uuid'
import { Logger } from 'winston'
import { dirname } from 'path'

import { Item } from '../../Domain/Item/Item'
import { ItemBackupServiceInterface } from '../../Domain/Item/ItemBackupServiceInterface'
import { ItemBackupRepresentation } from '../../Mapping/Backup/ItemBackupRepresentation'

export class FSItemBackupService implements ItemBackupServiceInterface {
  constructor(
    private fileUploadPath: string,
    private mapper: MapperInterface<Item, ItemBackupRepresentation>,
    private logger: Logger,
  ) {}

  async backup(_items: Item[], _authParams: KeyParamsData, _contentSizeLimit?: number): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  async dump(item: Item): Promise<string> {
    const contents = JSON.stringify({
      item: this.mapper.toProjection(item),
    })

    const path = `${this.fileUploadPath}/dumps/${uuid.v4()}`

    this.logger.debug(`Dumping item ${item.id.toString()} to ${path}`)

    await promises.mkdir(dirname(path), { recursive: true })

    await promises.writeFile(path, contents)

    const fileCreated = (await promises.stat(path)).isFile()

    if (!fileCreated) {
      throw new Error(`Could not create dump file ${path}`)
    }

    return path
  }
}
