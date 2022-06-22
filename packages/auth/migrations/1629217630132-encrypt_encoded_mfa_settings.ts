import { MigrationInterface, QueryRunner } from 'typeorm'
import { CryptoNode } from '@standardnotes/sncrypto-node'

export class encryptEncodedMfaSettings1629217630132 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const encodedMFASettings = await queryRunner.manager.query(
      'SELECT s.uuid as uuid, s.value as value, u.encrypted_server_key as encrypted_server_key FROM settings s LEFT JOIN users u ON u.uuid = s.user_uuid WHERE s.name = "MFA_SECRET" AND s.server_encryption_version = 0',
    )

    for (const encodedMFASetting of encodedMFASettings) {
      if (!encodedMFASetting['value']) {
        continue
      }

      const mfaSecret = this.getDecodedMFASecret(encodedMFASetting['value'])

      if (!mfaSecret) {
        continue
      }

      const encryptedMFASecret = await this.encryptMFASecret(mfaSecret, encodedMFASetting['encrypted_server_key'])

      await queryRunner.manager.query(
        `UPDATE settings s SET s.value = '${encryptedMFASecret}', s.server_encryption_version = 1 WHERE s.uuid="${encodedMFASetting['uuid']}"`,
      )
    }
  }

  public async down(): Promise<void> {
    return
  }

  private async encryptMFASecret(secret: string, userEncryptedServerKey: string): Promise<string> {
    const crypto = new CryptoNode()

    const userServerKey = JSON.parse(userEncryptedServerKey)

    const decryptedUserServerKey = await crypto.aes256GcmDecrypt(
      userServerKey.encrypted,
      process.env.ENCRYPTION_SERVER_KEY as string,
    )

    const iv = await crypto.generateRandomKey(128)

    const encrypted = await crypto.aes256GcmEncrypt({
      unencrypted: secret,
      iv,
      key: decryptedUserServerKey,
    })

    return JSON.stringify({ version: 1, encrypted })
  }

  private getDecodedMFASecret(encodedValue: string): string | undefined {
    const valueBuffer = Buffer.from(encodedValue.substring(3), 'base64')
    const decodedValue = valueBuffer.toString()

    const decodedMFASecretObject = JSON.parse(decodedValue)

    if ('secret' in decodedMFASecretObject && decodedMFASecretObject.secret) {
      return decodedMFASecretObject.secret
    }

    return undefined
  }
}
