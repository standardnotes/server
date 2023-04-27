import { MigrationInterface, QueryRunner } from 'typeorm'

export class initSqlite1682333453967 implements MigrationInterface {
  name = 'initSqlite1682333453967'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "offline_user_subscriptions" ("uuid" varchar PRIMARY KEY NOT NULL, "email" varchar(255) NOT NULL, "plan_name" varchar(255) NOT NULL, "ends_at" bigint NOT NULL, "created_at" bigint NOT NULL, "updated_at" bigint NOT NULL, "cancelled" tinyint NOT NULL DEFAULT (0), "subscription_id" integer)',
    )
    await queryRunner.query('CREATE INDEX "email" ON "offline_user_subscriptions" ("email") ')
    await queryRunner.query(
      'CREATE TABLE "revoked_sessions" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(36) NOT NULL, "received" tinyint NOT NULL DEFAULT (0), "created_at" datetime NOT NULL, "received_at" datetime, "user_agent" text, "api_version" varchar(255))',
    )
    await queryRunner.query('CREATE INDEX "index_revoked_sessions_on_user_uuid" ON "revoked_sessions" ("user_uuid") ')
    await queryRunner.query(
      'CREATE TABLE "settings" ("uuid" varchar PRIMARY KEY NOT NULL, "name" varchar(255) NOT NULL, "value" text, "server_encryption_version" tinyint NOT NULL DEFAULT (0), "created_at" bigint NOT NULL, "updated_at" bigint NOT NULL, "sensitive" tinyint NOT NULL DEFAULT (0), "user_uuid" varchar NOT NULL)',
    )
    await queryRunner.query('CREATE INDEX "index_settings_on_updated_at" ON "settings" ("updated_at") ')
    await queryRunner.query('CREATE INDEX "index_settings_on_name_and_user_uuid" ON "settings" ("name", "user_uuid") ')
    await queryRunner.query(
      'CREATE TABLE "subscription_settings" ("uuid" varchar PRIMARY KEY NOT NULL, "name" varchar(255) NOT NULL, "value" text, "server_encryption_version" tinyint NOT NULL DEFAULT (0), "created_at" bigint NOT NULL, "updated_at" bigint NOT NULL, "sensitive" tinyint NOT NULL DEFAULT (0), "user_subscription_uuid" varchar NOT NULL)',
    )
    await queryRunner.query(
      'CREATE INDEX "index_subcsription_settings_on_updated_at" ON "subscription_settings" ("updated_at") ',
    )
    await queryRunner.query(
      'CREATE INDEX "index_settings_on_name_and_user_subscription_uuid" ON "subscription_settings" ("name", "user_subscription_uuid") ',
    )
    await queryRunner.query(
      'CREATE TABLE "user_subscriptions" ("uuid" varchar PRIMARY KEY NOT NULL, "plan_name" varchar(255) NOT NULL, "ends_at" bigint NOT NULL, "created_at" bigint NOT NULL, "updated_at" bigint NOT NULL, "renewed_at" bigint, "cancelled" tinyint NOT NULL DEFAULT (0), "subscription_id" integer, "subscription_type" varchar(24) NOT NULL, "user_uuid" varchar NOT NULL)',
    )
    await queryRunner.query('CREATE INDEX "updated_at" ON "user_subscriptions" ("updated_at") ')
    await queryRunner.query(
      'CREATE TABLE "emergency_access_invitations" ("uuid" varchar PRIMARY KEY NOT NULL, "grantor_uuid" varchar(36) NOT NULL, "grantee_uuid" varchar(36) NOT NULL, "status" varchar(36) NOT NULL, "expires_at" datetime NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL)',
    )
    await queryRunner.query(
      'CREATE TABLE "users" ("uuid" varchar PRIMARY KEY NOT NULL, "version" varchar(255), "email" varchar(255), "pw_nonce" varchar(255), "encrypted_server_key" varchar(255), "server_encryption_version" tinyint NOT NULL DEFAULT (0), "kp_created" varchar(255), "kp_origination" varchar(255), "pw_cost" integer, "pw_key_size" integer, "pw_salt" varchar(255), "pw_alg" varchar(255), "pw_func" varchar(255), "encrypted_password" varchar(255) NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "locked_until" datetime, "num_failed_attempts" integer)',
    )
    await queryRunner.query('CREATE INDEX "index_users_on_email" ON "users" ("email") ')
    await queryRunner.query(
      'CREATE TABLE "roles" ("uuid" varchar PRIMARY KEY NOT NULL, "name" varchar(255) NOT NULL, "version" smallint NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))',
    )
    await queryRunner.query('CREATE UNIQUE INDEX "name_and_version" ON "roles" ("name", "version") ')
    await queryRunner.query(
      'CREATE TABLE "permissions" ("uuid" varchar PRIMARY KEY NOT NULL, "name" varchar(255) NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))',
    )
    await queryRunner.query('CREATE UNIQUE INDEX "index_permissions_on_name" ON "permissions" ("name") ')
    await queryRunner.query(
      'CREATE TABLE "sessions" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(255), "hashed_access_token" varchar(255) NOT NULL, "hashed_refresh_token" varchar(255) NOT NULL, "access_expiration" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "refresh_expiration" datetime NOT NULL, "api_version" varchar(255), "user_agent" text, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "readonly_access" tinyint NOT NULL DEFAULT (0))',
    )
    await queryRunner.query('CREATE INDEX "index_sessions_on_user_uuid" ON "sessions" ("user_uuid") ')
    await queryRunner.query('CREATE INDEX "index_sessions_on_updated_at" ON "sessions" ("updated_at") ')
    await queryRunner.query(
      'CREATE TABLE "offline_settings" ("uuid" varchar PRIMARY KEY NOT NULL, "email" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "value" text, "server_encryption_version" tinyint NOT NULL DEFAULT (0), "created_at" bigint NOT NULL, "updated_at" bigint NOT NULL)',
    )
    await queryRunner.query(
      'CREATE INDEX "index_offline_settings_on_name_and_email" ON "offline_settings" ("name", "email") ',
    )
    await queryRunner.query(
      'CREATE TABLE "shared_subscription_invitations" ("uuid" varchar PRIMARY KEY NOT NULL, "inviter_identifier" varchar(255) NOT NULL, "inviter_identifier_type" varchar(24) NOT NULL, "invitee_identifier" varchar(255) NOT NULL, "invitee_identifier_type" varchar(24) NOT NULL, "status" varchar(255) NOT NULL, "subscription_id" integer NOT NULL, "created_at" bigint NOT NULL, "updated_at" bigint NOT NULL)',
    )
    await queryRunner.query(
      'CREATE INDEX "inviter_identifier" ON "shared_subscription_invitations" ("inviter_identifier") ',
    )
    await queryRunner.query(
      'CREATE INDEX "invitee_identifier" ON "shared_subscription_invitations" ("invitee_identifier") ',
    )
    await queryRunner.query(
      'CREATE INDEX "invitee_and_status" ON "shared_subscription_invitations" ("invitee_identifier", "status") ',
    )
    await queryRunner.query(
      'CREATE TABLE "authenticators" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(36) NOT NULL, "credential_id" text NOT NULL, "credential_public_key" blob NOT NULL, "counter" bigint NOT NULL, "credential_device_type" varchar(32) NOT NULL, "credential_backed_up" boolean NOT NULL, "transports" varchar(255), "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL)',
    )
    await queryRunner.query(
      'CREATE TABLE "authenticator_challenges" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(36) NOT NULL, "challenge" varchar(255) NOT NULL, "created_at" datetime NOT NULL)',
    )
    await queryRunner.query('CREATE UNIQUE INDEX "unique_user_uuid" ON "authenticator_challenges" ("user_uuid") ')
    await queryRunner.query(
      'CREATE TABLE "session_traces" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(36) NOT NULL, "username" varchar(255) NOT NULL, "subscription_plan_name" varchar(64), "created_at" datetime NOT NULL, "creation_date" date NOT NULL, "expires_at" datetime NOT NULL)',
    )
    await queryRunner.query('CREATE INDEX "subscription_plan_name" ON "session_traces" ("subscription_plan_name") ')
    await queryRunner.query('CREATE INDEX "creation_date" ON "session_traces" ("creation_date") ')
    await queryRunner.query(
      'CREATE UNIQUE INDEX "user_uuid_and_creation_date" ON "session_traces" ("user_uuid", "creation_date") ',
    )
    await queryRunner.query(
      'CREATE TABLE "offline_user_roles" ("offline_user_subscription_uuid" varchar NOT NULL, "role_uuid" varchar NOT NULL, PRIMARY KEY ("offline_user_subscription_uuid", "role_uuid"))',
    )
    await queryRunner.query(
      'CREATE INDEX "IDX_cd1b91693f6ee92d5f94ce2775" ON "offline_user_roles" ("offline_user_subscription_uuid") ',
    )
    await queryRunner.query('CREATE INDEX "IDX_027ba99043e6902f569d66417f" ON "offline_user_roles" ("role_uuid") ')
    await queryRunner.query(
      'CREATE TABLE "user_roles" ("user_uuid" varchar NOT NULL, "role_uuid" varchar NOT NULL, PRIMARY KEY ("user_uuid", "role_uuid"))',
    )
    await queryRunner.query('CREATE INDEX "IDX_2ebc2e1e2cb1d730d018893dae" ON "user_roles" ("user_uuid") ')
    await queryRunner.query('CREATE INDEX "IDX_0ea82c7b2302d7af0f8b789d79" ON "user_roles" ("role_uuid") ')
    await queryRunner.query(
      'CREATE TABLE "role_permissions" ("role_uuid" varchar NOT NULL, "permission_uuid" varchar NOT NULL, PRIMARY KEY ("role_uuid", "permission_uuid"))',
    )
    await queryRunner.query('CREATE INDEX "IDX_7be6db7b59fb622e6c16ba124c" ON "role_permissions" ("role_uuid") ')
    await queryRunner.query('CREATE INDEX "IDX_f985b194ff27dde81fb470c192" ON "role_permissions" ("permission_uuid") ')
    await queryRunner.query('DROP INDEX "index_revoked_sessions_on_user_uuid"')
    await queryRunner.query(
      'CREATE TABLE "temporary_revoked_sessions" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(36) NOT NULL, "received" tinyint NOT NULL DEFAULT (0), "created_at" datetime NOT NULL, "received_at" datetime, "user_agent" text, "api_version" varchar(255), CONSTRAINT "FK_edaf18faca67e682be39b5ecae5" FOREIGN KEY ("user_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE NO ACTION)',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_revoked_sessions"("uuid", "user_uuid", "received", "created_at", "received_at", "user_agent", "api_version") SELECT "uuid", "user_uuid", "received", "created_at", "received_at", "user_agent", "api_version" FROM "revoked_sessions"',
    )
    await queryRunner.query('DROP TABLE "revoked_sessions"')
    await queryRunner.query('ALTER TABLE "temporary_revoked_sessions" RENAME TO "revoked_sessions"')
    await queryRunner.query('CREATE INDEX "index_revoked_sessions_on_user_uuid" ON "revoked_sessions" ("user_uuid") ')
    await queryRunner.query('DROP INDEX "index_settings_on_updated_at"')
    await queryRunner.query('DROP INDEX "index_settings_on_name_and_user_uuid"')
    await queryRunner.query(
      'CREATE TABLE "temporary_settings" ("uuid" varchar PRIMARY KEY NOT NULL, "name" varchar(255) NOT NULL, "value" text, "server_encryption_version" tinyint NOT NULL DEFAULT (0), "created_at" bigint NOT NULL, "updated_at" bigint NOT NULL, "sensitive" tinyint NOT NULL DEFAULT (0), "user_uuid" varchar NOT NULL, CONSTRAINT "FK_214aab0c0380e81fb51093595cb" FOREIGN KEY ("user_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE NO ACTION)',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_settings"("uuid", "name", "value", "server_encryption_version", "created_at", "updated_at", "sensitive", "user_uuid") SELECT "uuid", "name", "value", "server_encryption_version", "created_at", "updated_at", "sensitive", "user_uuid" FROM "settings"',
    )
    await queryRunner.query('DROP TABLE "settings"')
    await queryRunner.query('ALTER TABLE "temporary_settings" RENAME TO "settings"')
    await queryRunner.query('CREATE INDEX "index_settings_on_updated_at" ON "settings" ("updated_at") ')
    await queryRunner.query('CREATE INDEX "index_settings_on_name_and_user_uuid" ON "settings" ("name", "user_uuid") ')
    await queryRunner.query('DROP INDEX "index_subcsription_settings_on_updated_at"')
    await queryRunner.query('DROP INDEX "index_settings_on_name_and_user_subscription_uuid"')
    await queryRunner.query(
      'CREATE TABLE "temporary_subscription_settings" ("uuid" varchar PRIMARY KEY NOT NULL, "name" varchar(255) NOT NULL, "value" text, "server_encryption_version" tinyint NOT NULL DEFAULT (0), "created_at" bigint NOT NULL, "updated_at" bigint NOT NULL, "sensitive" tinyint NOT NULL DEFAULT (0), "user_subscription_uuid" varchar NOT NULL, CONSTRAINT "FK_ad2907de2850d8b531ff23329f3" FOREIGN KEY ("user_subscription_uuid") REFERENCES "user_subscriptions" ("uuid") ON DELETE CASCADE ON UPDATE NO ACTION)',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_subscription_settings"("uuid", "name", "value", "server_encryption_version", "created_at", "updated_at", "sensitive", "user_subscription_uuid") SELECT "uuid", "name", "value", "server_encryption_version", "created_at", "updated_at", "sensitive", "user_subscription_uuid" FROM "subscription_settings"',
    )
    await queryRunner.query('DROP TABLE "subscription_settings"')
    await queryRunner.query('ALTER TABLE "temporary_subscription_settings" RENAME TO "subscription_settings"')
    await queryRunner.query(
      'CREATE INDEX "index_subcsription_settings_on_updated_at" ON "subscription_settings" ("updated_at") ',
    )
    await queryRunner.query(
      'CREATE INDEX "index_settings_on_name_and_user_subscription_uuid" ON "subscription_settings" ("name", "user_subscription_uuid") ',
    )
    await queryRunner.query('DROP INDEX "updated_at"')
    await queryRunner.query(
      'CREATE TABLE "temporary_user_subscriptions" ("uuid" varchar PRIMARY KEY NOT NULL, "plan_name" varchar(255) NOT NULL, "ends_at" bigint NOT NULL, "created_at" bigint NOT NULL, "updated_at" bigint NOT NULL, "renewed_at" bigint, "cancelled" tinyint NOT NULL DEFAULT (0), "subscription_id" integer, "subscription_type" varchar(24) NOT NULL, "user_uuid" varchar NOT NULL, CONSTRAINT "FK_f44dae0a64c70e6b50de5442d2b" FOREIGN KEY ("user_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE NO ACTION)',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_user_subscriptions"("uuid", "plan_name", "ends_at", "created_at", "updated_at", "renewed_at", "cancelled", "subscription_id", "subscription_type", "user_uuid") SELECT "uuid", "plan_name", "ends_at", "created_at", "updated_at", "renewed_at", "cancelled", "subscription_id", "subscription_type", "user_uuid" FROM "user_subscriptions"',
    )
    await queryRunner.query('DROP TABLE "user_subscriptions"')
    await queryRunner.query('ALTER TABLE "temporary_user_subscriptions" RENAME TO "user_subscriptions"')
    await queryRunner.query('CREATE INDEX "updated_at" ON "user_subscriptions" ("updated_at") ')
    await queryRunner.query(
      'CREATE TABLE "temporary_emergency_access_invitations" ("uuid" varchar PRIMARY KEY NOT NULL, "grantor_uuid" varchar(36) NOT NULL, "grantee_uuid" varchar(36) NOT NULL, "status" varchar(36) NOT NULL, "expires_at" datetime NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, CONSTRAINT "grantor_uuid_fk" FOREIGN KEY ("grantor_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "grantee_uuid_fk" FOREIGN KEY ("grantee_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE NO ACTION)',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_emergency_access_invitations"("uuid", "grantor_uuid", "grantee_uuid", "status", "expires_at", "created_at", "updated_at") SELECT "uuid", "grantor_uuid", "grantee_uuid", "status", "expires_at", "created_at", "updated_at" FROM "emergency_access_invitations"',
    )
    await queryRunner.query('DROP TABLE "emergency_access_invitations"')
    await queryRunner.query(
      'ALTER TABLE "temporary_emergency_access_invitations" RENAME TO "emergency_access_invitations"',
    )
    await queryRunner.query('DROP INDEX "IDX_cd1b91693f6ee92d5f94ce2775"')
    await queryRunner.query('DROP INDEX "IDX_027ba99043e6902f569d66417f"')
    await queryRunner.query(
      'CREATE TABLE "temporary_offline_user_roles" ("offline_user_subscription_uuid" varchar NOT NULL, "role_uuid" varchar NOT NULL, CONSTRAINT "FK_cd1b91693f6ee92d5f94ce27758" FOREIGN KEY ("offline_user_subscription_uuid") REFERENCES "offline_user_subscriptions" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_027ba99043e6902f569d66417f0" FOREIGN KEY ("role_uuid") REFERENCES "roles" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("offline_user_subscription_uuid", "role_uuid"))',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_offline_user_roles"("offline_user_subscription_uuid", "role_uuid") SELECT "offline_user_subscription_uuid", "role_uuid" FROM "offline_user_roles"',
    )
    await queryRunner.query('DROP TABLE "offline_user_roles"')
    await queryRunner.query('ALTER TABLE "temporary_offline_user_roles" RENAME TO "offline_user_roles"')
    await queryRunner.query(
      'CREATE INDEX "IDX_cd1b91693f6ee92d5f94ce2775" ON "offline_user_roles" ("offline_user_subscription_uuid") ',
    )
    await queryRunner.query('CREATE INDEX "IDX_027ba99043e6902f569d66417f" ON "offline_user_roles" ("role_uuid") ')
    await queryRunner.query('DROP INDEX "IDX_2ebc2e1e2cb1d730d018893dae"')
    await queryRunner.query('DROP INDEX "IDX_0ea82c7b2302d7af0f8b789d79"')
    await queryRunner.query(
      'CREATE TABLE "temporary_user_roles" ("user_uuid" varchar NOT NULL, "role_uuid" varchar NOT NULL, CONSTRAINT "FK_2ebc2e1e2cb1d730d018893daef" FOREIGN KEY ("user_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_0ea82c7b2302d7af0f8b789d797" FOREIGN KEY ("role_uuid") REFERENCES "roles" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("user_uuid", "role_uuid"))',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_user_roles"("user_uuid", "role_uuid") SELECT "user_uuid", "role_uuid" FROM "user_roles"',
    )
    await queryRunner.query('DROP TABLE "user_roles"')
    await queryRunner.query('ALTER TABLE "temporary_user_roles" RENAME TO "user_roles"')
    await queryRunner.query('CREATE INDEX "IDX_2ebc2e1e2cb1d730d018893dae" ON "user_roles" ("user_uuid") ')
    await queryRunner.query('CREATE INDEX "IDX_0ea82c7b2302d7af0f8b789d79" ON "user_roles" ("role_uuid") ')
    await queryRunner.query('DROP INDEX "IDX_7be6db7b59fb622e6c16ba124c"')
    await queryRunner.query('DROP INDEX "IDX_f985b194ff27dde81fb470c192"')
    await queryRunner.query(
      'CREATE TABLE "temporary_role_permissions" ("role_uuid" varchar NOT NULL, "permission_uuid" varchar NOT NULL, CONSTRAINT "FK_7be6db7b59fb622e6c16ba124c8" FOREIGN KEY ("role_uuid") REFERENCES "roles" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_f985b194ff27dde81fb470c1920" FOREIGN KEY ("permission_uuid") REFERENCES "permissions" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("role_uuid", "permission_uuid"))',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_role_permissions"("role_uuid", "permission_uuid") SELECT "role_uuid", "permission_uuid" FROM "role_permissions"',
    )
    await queryRunner.query('DROP TABLE "role_permissions"')
    await queryRunner.query('ALTER TABLE "temporary_role_permissions" RENAME TO "role_permissions"')
    await queryRunner.query('CREATE INDEX "IDX_7be6db7b59fb622e6c16ba124c" ON "role_permissions" ("role_uuid") ')
    await queryRunner.query('CREATE INDEX "IDX_f985b194ff27dde81fb470c192" ON "role_permissions" ("permission_uuid") ')
  }

  public async down(): Promise<void> {
    return
  }
}
