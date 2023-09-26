import { Result, RoleNameCollection, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DumpItemDTO } from './DumpItemDTO'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../../../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { ItemRepositoryResolverInterface } from '../../../Item/ItemRepositoryResolverInterface'

export class DumpItem implements UseCaseInterface<void> {
  constructor(
    private itemRepositoryResolver: ItemRepositoryResolverInterface,
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

    const itemRepositoryOrError = this.getItemRepository(dto.roleNames)
    if (itemRepositoryOrError.isFailed()) {
      return Result.fail(`Failed to dump item: ${itemRepositoryOrError.getError()}`)
    }
    const itemRepository = itemRepositoryOrError.getValue()

    const item = await itemRepository.findByUuid(itemUuid)
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
        roleNames: dto.roleNames,
      }),
    )

    return Result.ok()
  }

  private getItemRepository(stringRoleNames: string[]): Result<ItemRepositoryInterface> {
    const roleNamesOrError = RoleNameCollection.create(stringRoleNames)
    if (roleNamesOrError.isFailed()) {
      return Result.fail(`Could not obtain item repository based on role names: ${roleNamesOrError.getError()}`)
    }
    const roleNames = roleNamesOrError.getValue()

    const itemRepository = this.itemRepositoryResolver.resolve(roleNames)

    return Result.ok(itemRepository)
  }
}
