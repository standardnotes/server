import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { CheckForContentLimitDTO } from './CheckForContentLimitDTO'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { ItemContentSizeDescriptor } from '../../../Item/ItemContentSizeDescriptor'
import { ItemHash } from '../../../Item/ItemHash'

export class CheckForContentLimit implements UseCaseInterface<void> {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private freeUserContentLimitInBytes: number,
  ) {}

  async execute(dto: CheckForContentLimitDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const contentSizeDescriptors = await this.itemRepository.findContentSizeForComputingTransferLimit({
      userUuid: userUuid.value,
    })

    const isContentLimitExceeded = await this.isContentLimitExceeded(contentSizeDescriptors)
    const isUserModificationsIncreasingContentSize = this.userModificationsAreIncreasingContentSize(
      contentSizeDescriptors,
      dto.itemsBeingModified,
    )

    if (isContentLimitExceeded && isUserModificationsIncreasingContentSize) {
      return Result.fail('You have exceeded your content limit. Please upgrade your account.')
    }

    return Result.ok()
  }

  private userModificationsAreIncreasingContentSize(
    contentSizeDescriptors: ItemContentSizeDescriptor[],
    itemHashes: ItemHash[],
  ): boolean {
    for (const itemHash of itemHashes) {
      const contentSizeDescriptor = contentSizeDescriptors.find(
        (descriptor) => descriptor.props.uuid.value === itemHash.props.uuid,
      )
      if (contentSizeDescriptor) {
        const afterModificationSize = itemHash.calculateContentSize()
        const beforeModificationSize = contentSizeDescriptor.props.contentSize ?? 0
        if (afterModificationSize > beforeModificationSize) {
          return true
        }
      }
    }

    return false
  }

  private async isContentLimitExceeded(contentSizeDescriptors: ItemContentSizeDescriptor[]): Promise<boolean> {
    const totalContentSize = contentSizeDescriptors.reduce(
      (acc, descriptor) => acc + (descriptor.props.contentSize ? +descriptor.props.contentSize : 0),
      0,
    )

    return totalContentSize > this.freeUserContentLimitInBytes
  }
}
