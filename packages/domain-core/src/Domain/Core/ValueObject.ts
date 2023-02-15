/* istanbul ignore file */
import { ValueObjectProps } from './ValueObjectProps'

export abstract class ValueObject<T extends ValueObjectProps> {
  public readonly props: T

  constructor(props: T) {
    this.props = Object.freeze(props)
  }
}
