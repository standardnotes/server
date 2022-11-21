import { ContentType as ContentTypeValues } from '@standardnotes/common'
import { Result, ValueObject } from '@standardnotes/domain-core'

import { ContentTypeProps } from './ContentTypeProps'

export class ContentType extends ValueObject<ContentTypeProps> {
  get value(): string | null {
    return this.props.value
  }

  private constructor(props: ContentTypeProps) {
    super(props)
  }

  static create(contentType: string | null): Result<ContentType> {
    if (contentType !== null && !Object.values(ContentTypeValues).includes(contentType as ContentTypeValues)) {
      return Result.fail<ContentType>(`Value is not a valid content type: ${contentType}`)
    } else {
      return Result.ok<ContentType>(new ContentType({ value: contentType }))
    }
  }
}
