import { KeyParamsData } from '@standardnotes/responses'
import { promises } from 'fs'
import * as uuid from 'uuid'
import { inject, injectable } from 'inversify'

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
  ) {}

  async backup(_items: Item[], _authParams: KeyParamsData): Promise<string> {
    throw new Error('Method not implemented.')
  }

  async dump(item: Item): Promise<string> {
    const contents = JSON.stringify({
      item: await this.itemProjector.projectCustom('dump', item),
    })

    const path = `${this.fileUploadPath}/dumps/${uuid.v4()}`

    await promises.writeFile(path, contents)

    return path
  }
}
