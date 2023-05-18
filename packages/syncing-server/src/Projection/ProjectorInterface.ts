export interface ProjectorInterface<T, E> {
  projectSimple(object: T): Partial<E>
  projectFull(object: T): E
  projectCustom(projectionType: string, object: T, ...args: any[]): E
}
