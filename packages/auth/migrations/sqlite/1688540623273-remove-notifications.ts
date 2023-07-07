import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveNotifications1688540623273 implements MigrationInterface {
  name = 'RemoveNotifications1688540623273'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "index_notifications_on_user_uuid"')
    await queryRunner.query('DROP TABLE "notifications"')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "notifications" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(36) NOT NULL, "type" varchar(36) NOT NULL, "payload" text NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query('CREATE INDEX "index_notifications_on_user_uuid" ON "notifications" ("user_uuid") ')
  }
}
