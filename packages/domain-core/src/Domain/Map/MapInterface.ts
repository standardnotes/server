export interface MapInterface<T, U> {
  toDomain(persistence: U): T
  toProjection(domain: T): U
}
