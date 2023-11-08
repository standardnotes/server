import { Result } from '@standardnotes/domain-core'

export interface CSVFileReaderInterface {
  getValues(fileName: string): Promise<Result<string[]>>
}
