import { Aggregate, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { ItemProps } from './ItemProps'

export class Item extends Aggregate<ItemProps> {
  private constructor(props: ItemProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: ItemProps, id?: UniqueEntityId): Result<Item> {
    if (!props.contentSize) {
      const contentSize = Buffer.byteLength(JSON.stringify(props))
      props.contentSize = contentSize
    }

    return Result.ok<Item>(new Item(props, id))
  }
}
