import { ItemHash } from '../Item/ItemHash'
import { ItemServiceInterface } from '../Item/ItemServiceInterface'
import { UseCaseInterface } from './UseCaseInterface'

type SaveItemDTO = {
  userUuid: string
  itemHash: ItemHash
  apiVersion: string
  readOnlyAccess: boolean
  sessionUuid: string | null
}

export class SaveItemUseCase implements UseCaseInterface {
  constructor(private itemService: ItemServiceInterface) {}

  async execute(dto: SaveItemDTO): Promise<{ success: boolean }> {
    const saveItemsResult = await this.itemService.saveItems({
      itemHashes: [dto.itemHash],
      userUuid: dto.userUuid,
      apiVersion: dto.apiVersion,
      readOnlyAccess: dto.readOnlyAccess,
      sessionUuid: dto.sessionUuid,
    })

    return { success: saveItemsResult.savedItems.length > 0 }
  }
}
