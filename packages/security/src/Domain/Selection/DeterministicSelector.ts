import { SelectorInterface } from './SelectorInterface'

export class DeterministicSelector<T> implements SelectorInterface<T> {
  private readonly CHAR_0_CODE = 48

  select(inputKey: string, values: T[]): T {
    const firstChar = inputKey[0]
    const firstCharCode = firstChar.charCodeAt(0)

    const normalizedCode = firstCharCode - this.CHAR_0_CODE

    const index = normalizedCode % values.length

    return values[index]
  }
}
