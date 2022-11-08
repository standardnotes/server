/* istanbul ignore file */

export class Result<T> {
  constructor(private isSuccess: boolean, private error?: T | string, private value?: T) {
    Object.freeze(this)
  }

  isFailed(): boolean {
    return !this.isSuccess
  }

  getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value of an unsuccessfull result')
    }

    return this.value as T
  }

  getError(): T | string {
    if (this.isSuccess || this.error === undefined) {
      throw new Error('Cannot get an error of a successfull result')
    }

    return this.error
  }

  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value)
  }

  static fail<U>(error: U | string): Result<U> {
    return new Result<U>(false, error)
  }
}
