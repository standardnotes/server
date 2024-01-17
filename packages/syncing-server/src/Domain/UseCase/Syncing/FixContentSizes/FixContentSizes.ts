import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'

import { FixContentSizesDTO } from './FixContentSizesDTO'

export class FixContentSizes implements UseCaseInterface<void> {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private logger: Logger,
  ) {}

  async execute(dto: FixContentSizesDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const count = await this.itemRepository.countAll({
      userUuid: userUuid.value,
    })

    this.logger.info(`Fixing content sizes for ${count} items`, {
      userId: userUuid.value,
      codeTag: 'FixContentSizes',
    })

    const pageSize = 100
    let page = 1
    const totalPages = Math.ceil(count / pageSize)

    for (page; page <= totalPages; page++) {
      const items = await this.itemRepository.findAll({
        userUuid: userUuid.value,
        sortOrder: 'ASC',
        sortBy: 'created_at_timestamp',
        offset: (page - 1) * pageSize,
        limit: pageSize,
      })

      for (const item of items) {
        if (item.props.contentSize != item.calculateContentSize()) {
          this.logger.info(`Fixing content size for item ${item.id}`, {
            userId: userUuid.value,
            codeTag: 'FixContentSizes',
            itemUuid: item.uuid.value,
            oldContentSize: item.props.contentSize,
            newContentSize: item.calculateContentSize(),
          })

          await this.itemRepository.updateContentSize(item.id.toString(), item.calculateContentSize())
        }
      }
    }

    this.logger.info(`Finished fixing content sizes for ${count} items`, {
      userId: userUuid.value,
      codeTag: 'FixContentSizes',
    })

    return Result.ok()
  }
}
