/* istanbul ignore file */

import { shallowEqual } from 'shallow-equal-object'

import { ValueObjectProps } from './ValueObjectProps'

export abstract class ValueObject<T extends ValueObjectProps> {
  public readonly props: T

  constructor(props: T) {
    this.props = Object.freeze(props)
  }

  equals(valueObject?: ValueObject<T>): boolean {
    if (valueObject === null || valueObject === undefined) {
      return false
    }
    if (valueObject.props === undefined) {
      return false
    }

    return shallowEqual(this.props, valueObject.props)
  }
}
