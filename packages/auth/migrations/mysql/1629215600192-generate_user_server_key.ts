import { MigrationInterface, QueryRunner } from 'typeorm'
import { CryptoNode } from '@standardnotes/sncrypto-node'

export class generateUserServerKey1629215600192 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const crypto = new CryptoNode()

    const users = await queryRunner.manager.query(
      'SELECT * FROM users where encrypted_server_key IS NULL ORDER BY created_at',
    )
    for (const user of users) {
      const unencrypted = await crypto.generateRandomKey(256)
      const iv = await crypto.generateRandomKey(128)
      const encrypted = await crypto.aes256GcmEncrypt({
        unencrypted,
        iv,
        key: process.env.ENCRYPTION_SERVER_KEY as string,
      })
      const encryptedServerKey = JSON.stringify({ version: 1, encrypted })

      await queryRunner.manager.query(
        `UPDATE users SET encrypted_server_key = '${encryptedServerKey}', server_encryption_version = 1 WHERE uuid = "${user['uuid']}"`,
      )
    }
  }

  public async down(): Promise<void> {
    return
  }
}
