import Redis, { Cluster } from 'ioredis'
import { SettingName } from '@standardnotes/settings'
import { MigrationInterface, QueryRunner } from 'typeorm'

import { Setting } from '../../src/Domain/Setting/Setting'
import { User } from '../../src/Domain/User/User'
import { EncryptionVersion } from '../../src/Domain/Encryption/EncryptionVersion'
import { Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

export class moveMfaItemsToUserSettings1627638504691 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const itemsTableExistsQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = "items"',
    )
    const itemsTableExists = itemsTableExistsQueryResult[0].count === 1
    if (!itemsTableExists) {
      return
    }

    const items = await queryRunner.manager.query(
      'SELECT * FROM items WHERE content_type = "SF|MFA" ORDER BY updated_at_timestamp ASC',
    )

    const usersMFAStatus = new Map<string, number>()
    const usersMFAUpdatedAt = new Map<string, number>()

    for (const item of items) {
      const user = await queryRunner.manager.findOne(User, item['user_uuid'])
      if (user === null) {
        continue
      }

      usersMFAStatus.set(item['user_uuid'], 1)
      usersMFAUpdatedAt.set(item['user_uuid'], item['updated_at_timestamp'])

      const settingOrError = Setting.create(
        {
          name: SettingName.NAMES.MfaSecret,
          value: item['deleted'] ? null : item['content'],
          serverEncryptionVersion: EncryptionVersion.Unencrypted,
          timestamps: Timestamps.create(item['created_at_timestamp'], item['updated_at_timestamp']).getValue(),
          userUuid: Uuid.create(user.uuid).getValue(),
          sensitive: true,
        },
        new UniqueEntityId(item['uuid']),
      )
      if (item['deleted']) {
        usersMFAStatus.set(item['user_uuid'], 0)
      }
      await queryRunner.manager.save(settingOrError.getValue())
    }

    const redisClient = this.getRedisClient()

    for (const userUuid of usersMFAStatus.keys()) {
      await redisClient.set(`mfa:${userUuid}`, usersMFAStatus.get(userUuid) as number)
      await redisClient.set(`mfa_ua:${userUuid}`, usersMFAUpdatedAt.get(userUuid) as number)
    }

    await queryRunner.manager.query('DELETE FROM items WHERE content_type = "SF|MFA"')
  }

  public async down(): Promise<void> {
    return
  }

  private getRedisClient(): Redis | Cluster {
    const redisUrl = process.env.REDIS_URL as string
    const isRedisInClusterMode = redisUrl.indexOf(',') > 0
    if (isRedisInClusterMode) {
      return new Redis.Cluster(redisUrl.split(','))
    }

    return new Redis(redisUrl)
  }
}
