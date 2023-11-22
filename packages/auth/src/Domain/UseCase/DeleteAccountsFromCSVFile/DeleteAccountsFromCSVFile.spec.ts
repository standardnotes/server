import { Logger } from 'winston'
import { Result } from '@standardnotes/domain-core'
import { AccountDeletionVerificationRequestedEvent, DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { CSVFileReaderInterface } from '../../CSV/CSVFileReaderInterface'
import { DeleteAccountsFromCSVFile } from './DeleteAccountsFromCSVFile'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { User } from '../../User/User'

describe('DeleteAccountsFromCSVFile', () => {
  let csvFileReader: CSVFileReaderInterface
  let userRepository: UserRepositoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let logger: Logger

  const createUseCase = () =>
    new DeleteAccountsFromCSVFile(csvFileReader, domainEventPublisher, domainEventFactory, userRepository, logger)

  beforeEach(() => {
    const user = {} as jest.Mocked<User>

    csvFileReader = {} as jest.Mocked<CSVFileReaderInterface>
    csvFileReader.getValues = jest.fn().mockResolvedValue(Result.ok(['email1']))

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findAllByUsernameOrEmail = jest.fn().mockResolvedValue([user])

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createAccountDeletionVerificationRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<AccountDeletionVerificationRequestedEvent>)

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
  })

  it('should request account deletion verification', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ fileName: 'test.csv', dryRun: false })

    expect(domainEventPublisher.publish).toHaveBeenCalled()

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

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(result.isFailed()).toBeFalsy()
  })

  it('should return error username is invalid', async () => {
    csvFileReader.getValues = jest.fn().mockResolvedValue(Result.ok(['']))

    const useCase = createUseCase()

    const result = await useCase.execute({ fileName: 'test.csv', dryRun: false })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should do nothing if users could not be found', async () => {
    userRepository.findAllByUsernameOrEmail = jest.fn().mockResolvedValue([])

    const useCase = createUseCase()

    const result = await useCase.execute({ fileName: 'test.csv', dryRun: false })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(result.isFailed()).toBeFalsy()
  })
})
