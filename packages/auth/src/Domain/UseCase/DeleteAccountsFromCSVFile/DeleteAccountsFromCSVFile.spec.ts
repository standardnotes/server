import { Logger } from 'winston'
import { Result } from '@standardnotes/domain-core'

import { CSVFileReaderInterface } from '../../CSV/CSVFileReaderInterface'
import { DeleteAccount } from '../DeleteAccount/DeleteAccount'
import { DeleteAccountsFromCSVFile } from './DeleteAccountsFromCSVFile'

describe('DeleteAccountsFromCSVFile', () => {
  let csvFileReader: CSVFileReaderInterface
  let deleteAccount: DeleteAccount
  let logger: Logger

  const createUseCase = () => new DeleteAccountsFromCSVFile(csvFileReader, deleteAccount, logger)

  beforeEach(() => {
    csvFileReader = {} as jest.Mocked<CSVFileReaderInterface>
    csvFileReader.getValues = jest.fn().mockResolvedValue(Result.ok(['email1']))

    deleteAccount = {} as jest.Mocked<DeleteAccount>
    deleteAccount.execute = jest.fn().mockResolvedValue(Result.ok(''))

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
  })

  it('should delete accounts', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ fileName: 'test.csv', dryRun: false })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should return error if csv file is invalid', async () => {
    csvFileReader.getValues = jest.fn().mockResolvedValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({ fileName: 'test.csv', dryRun: false })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if csv file is empty', async () => {
    csvFileReader.getValues = jest.fn().mockResolvedValue(Result.ok([]))

    const useCase = createUseCase()

    const result = await useCase.execute({ fileName: 'test.csv', dryRun: false })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should do nothing on a dry run', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ fileName: 'test.csv', dryRun: true })

    expect(deleteAccount.execute).not.toHaveBeenCalled()
    expect(result.isFailed()).toBeFalsy()
  })

  it('should return error if delete account fails', async () => {
    deleteAccount.execute = jest.fn().mockResolvedValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({ fileName: 'test.csv', dryRun: false })

    expect(result.isFailed()).toBeTruthy()
  })
})
