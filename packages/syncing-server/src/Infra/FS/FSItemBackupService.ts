import { KeyParamsData } from '@standardnotes/responses'
import { promises } from 'fs'
import * as uuid from 'uuid'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import { dirname } from 'path'

import TYPES from '../../Bootstrap/Types'
import { Item } from '../../Domain/Item/Item'
import { ItemBackupServiceInterface } from '../../Domain/Item/ItemBackupServiceInterface'
import { ItemProjection } from '../../Projection/ItemProjection'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'

@injectable()
export class FSItemBackupService implements ItemBackupServiceInterface {
  constructor(
    @inject(TYPES.FILE_UPLOAD_PATH) private fileUploadPath: string,
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item, ItemProjection>,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async backup(_items: Item[], _authParams: KeyParamsData): Promise<string> {
    throw new Error('Method not implemented.')
  }

  async dump(item: Item): Promise<string> {
    const contents = JSON.stringify({
      item: await this.itemProjector.projectCustom('dump', item),
    })

    const path = `${this.fileUploadPath}/dumps/${uuid.v4()}`

    this.logger.debug(`Dumping item ${item.uuid} to ${path}`)

    await promises.mkdir(dirname(path), { recursive: true })

    await promises.writeFile(path, contents)

    return path
  }
}
