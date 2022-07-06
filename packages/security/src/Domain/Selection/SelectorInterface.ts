export interface SelectorInterface<T> {
  select(inputKey: string, values: Array<T>): T
}
