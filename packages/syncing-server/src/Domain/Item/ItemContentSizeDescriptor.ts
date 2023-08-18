import { Result, Uuid, ValueObject } from '@standardnotes/domain-core'

import { ItemContentSizeDescriptorProps } from './ItemContentSizeDescriptorProps'

export class ItemContentSizeDescriptor extends ValueObject<ItemContentSizeDescriptorProps> {
  private constructor(props: ItemContentSizeDescriptorProps) {
    super(props)
  }

  static create(itemUuidString: string, contentSize: number | null): Result<ItemContentSizeDescriptor> {
    const uuidOrError = Uuid.create(itemUuidString)
    if (uuidOrError.isFailed()) {
      return Result.fail<ItemContentSizeDescriptor>(uuidOrError.getError())
    }
    const uuid = uuidOrError.getValue()

    return Result.ok<ItemContentSizeDescriptor>(
      new ItemContentSizeDescriptor({
        uuid,
        contentSize,
      }),
    )
  }
}
