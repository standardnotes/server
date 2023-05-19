import { Repository, SelectQueryBuilder } from 'typeorm'
import { ContactQuery, ContactsRepositoryInterface } from './ContactRepositoryInterface'
import { Contact } from '../Model/Contact'

export class TypeORMContactRepository implements ContactsRepositoryInterface {
  constructor(private ormRepository: Repository<Contact>) {}

  async create(contact: Contact): Promise<Contact> {
    return this.ormRepository.save(contact)
  }

  async save(contact: Contact): Promise<Contact> {
    return this.ormRepository.save(contact)
  }

  findByUuid(uuid: string): Promise<Contact | null> {
    return this.ormRepository
      .createQueryBuilder('contact')
      .where('contact.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async remove(contact: Contact): Promise<Contact> {
    return this.ormRepository.remove(contact)
  }

  async findAll(query: ContactQuery): Promise<Contact[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: ContactQuery): SelectQueryBuilder<Contact> {
    const queryBuilder = this.ormRepository.createQueryBuilder('contact')

    if (query.userUuid) {
      queryBuilder.where('contact.user_uuid = :userUuid', { userUuid: query.userUuid })
    }

    if (query.contactUuid) {
      queryBuilder.andWhere('contact.contact_uuid = :contactUuid', { contactUuid: query.contactUuid })
    }

    if (query.lastSyncTime) {
      queryBuilder.andWhere('group_user.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}
