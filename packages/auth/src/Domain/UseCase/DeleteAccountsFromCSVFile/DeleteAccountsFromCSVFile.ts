import { Result, UseCaseInterface } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { DeleteAccount } from '../DeleteAccount/DeleteAccount'
import { CSVFileReaderInterface } from '../../CSV/CSVFileReaderInterface'
import { DeleteAccountsFromCSVFileDTO } from './DeleteAccountsFromCSVFileDTO'

export class DeleteAccountsFromCSVFile implements UseCaseInterface<void> {
  constructor(
    private csvFileReader: CSVFileReaderInterface,
    private deleteAccount: DeleteAccount,
    private logger: Logger,
  ) {}

  async execute(dto: DeleteAccountsFromCSVFileDTO): Promise<Result<void>> {
    const emailsOrError = await this.csvFileReader.getValues(dto.fileName)
    if (emailsOrError.isFailed()) {
      return Result.fail(emailsOrError.getError())
    }
    const emails = emailsOrError.getValue()

    if (emails.length === 0) {
      return Result.fail(`No emails found in CSV file ${dto.fileName}`)
    }

    if (dto.dryRun) {
      const firstTenEmails = emails.slice(0, 10)
      this.logger.info(
        `Dry run mode enabled. Would delete ${emails.length} accounts. First 10 emails: ${firstTenEmails}`,
      )

      return Result.ok()
    }

    for (const email of emails) {
      const deleteAccountOrError = await this.deleteAccount.execute({
        username: email,
      })

      if (deleteAccountOrError.isFailed()) {
        return Result.fail(deleteAccountOrError.getError())
      }
    }

    return Result.ok()
  }
}
