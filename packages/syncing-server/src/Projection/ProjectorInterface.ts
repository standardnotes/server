export interface ProjectorInterface<T, E> {
  projectSimple(object: T): Promise<Partial<E>>
  projectFull(object: T): Promise<E>
  projectCustom(projectionType: string, object: T, ...args: any[]): Promise<E>
}
