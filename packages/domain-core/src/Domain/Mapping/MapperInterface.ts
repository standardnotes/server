export interface MapperInterface<T, U> {
  toDomain(projection: U): T
  toProjection(domain: T): U
}
