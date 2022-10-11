export interface ProjectorInterface<T, E> {
  project(object: T): Promise<E>
}
