import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DumpItemDTO } from './DumpItemDTO'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../../../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'

export class DumpItem implements UseCaseInterface<void> {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private itemBackupService: ItemBackupServiceInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async execute(dto: DumpItemDTO): Promise<Result<void>> {
    const itemUuidOrError = Uuid.create(dto.itemUuid)
    if (itemUuidOrError.isFailed()) {
      return Result.fail(`Failed to dump item: ${itemUuidOrError.getError()}`)
    }
    const itemUuid = itemUuidOrError.getValue()

    const item = await this.itemRepository.findByUuid(itemUuid)
    if (item === null) {
      return Result.fail('Failed to dump item: Item not found')
    }

    const fileDumpPathOrError = await this.itemBackupService.dump(item)
    if (fileDumpPathOrError.isFailed()) {
      return Result.fail(`Failed to dump item: ${fileDumpPathOrError.getError()}`)
    }
    const fileDumpPath = fileDumpPathOrError.getValue()

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createItemDumpedEvent({
        fileDumpPath,
        userUuid: item.props.userUuid.value,
      }),
    )

    return Result.ok()
  }
}
