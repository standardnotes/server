export interface ValidatorInterface<T> {
  validate(data: T): boolean
}
