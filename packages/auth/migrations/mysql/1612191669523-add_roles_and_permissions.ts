import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRolesAndPermissions1612191669523 implements MigrationInterface {
  name = 'addRolesAndPermissions1612191669523'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `permissions` (`uuid` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX `index_permissions_on_name` (`name`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE `roles` (`uuid` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX `index_roles_on_name` (`name`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE `role_permissions` (`permission_uuid` varchar(36) NOT NULL, `role_uuid` varchar(36) NOT NULL, INDEX `IDX_f985b194ff27dde81fb470c192` (`permission_uuid`), INDEX `IDX_7be6db7b59fb622e6c16ba124c` (`role_uuid`), PRIMARY KEY (`permission_uuid`, `role_uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE `user_roles` (`role_uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, INDEX `IDX_0ea82c7b2302d7af0f8b789d79` (`role_uuid`), INDEX `IDX_2ebc2e1e2cb1d730d018893dae` (`user_uuid`), PRIMARY KEY (`role_uuid`, `user_uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'ALTER TABLE `role_permissions` ADD CONSTRAINT `FK_f985b194ff27dde81fb470c1920` FOREIGN KEY (`permission_uuid`) REFERENCES `permissions`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE `role_permissions` ADD CONSTRAINT `FK_7be6db7b59fb622e6c16ba124c8` FOREIGN KEY (`role_uuid`) REFERENCES `roles`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE `user_roles` ADD CONSTRAINT `FK_0ea82c7b2302d7af0f8b789d797` FOREIGN KEY (`role_uuid`) REFERENCES `roles`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE `user_roles` ADD CONSTRAINT `FK_2ebc2e1e2cb1d730d018893daef` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_roles` DROP FOREIGN KEY `FK_2ebc2e1e2cb1d730d018893daef`')
    await queryRunner.query('ALTER TABLE `user_roles` DROP FOREIGN KEY `FK_0ea82c7b2302d7af0f8b789d797`')
    await queryRunner.query('ALTER TABLE `role_permissions` DROP FOREIGN KEY `FK_7be6db7b59fb622e6c16ba124c8`')
    await queryRunner.query('ALTER TABLE `role_permissions` DROP FOREIGN KEY `FK_f985b194ff27dde81fb470c1920`')
    await queryRunner.query('DROP INDEX `IDX_2ebc2e1e2cb1d730d018893dae` ON `user_roles`')
    await queryRunner.query('DROP INDEX `IDX_0ea82c7b2302d7af0f8b789d79` ON `user_roles`')
    await queryRunner.query('DROP TABLE `user_roles`')
    await queryRunner.query('DROP INDEX `IDX_7be6db7b59fb622e6c16ba124c` ON `role_permissions`')
    await queryRunner.query('DROP INDEX `IDX_f985b194ff27dde81fb470c192` ON `role_permissions`')
    await queryRunner.query('DROP TABLE `role_permissions`')
    await queryRunner.query('DROP INDEX `index_roles_on_name` ON `roles`')
    await queryRunner.query('DROP TABLE `roles`')
    await queryRunner.query('DROP INDEX `index_permissions_on_name` ON `permissions`')
    await queryRunner.query('DROP TABLE `permissions`')
  }
}
