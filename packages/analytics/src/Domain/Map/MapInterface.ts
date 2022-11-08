export interface MapInterface<T, U> {
  toDomain(persistence: U): T
  toPersistence(domain: T): U
}
