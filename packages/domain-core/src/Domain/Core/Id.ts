/* istanbul ignore file */

export class Id<T> {
  constructor(private value: T) {}

  equals(id?: Id<T>): boolean {
    if (id === null || id === undefined) {
      return false
    }
    if (!(id instanceof this.constructor)) {
      return false
    }

    return id.toValue() === this.value
  }

  toString() {
    return String(this.value)
  }

  toValue(): T {
    return this.value
  }
}
