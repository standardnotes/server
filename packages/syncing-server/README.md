## Migrations

### Generating a migration

```
yarn build && yarn typeorm migration:generate -d dist/src/Bootstrap/DataSource.js migrations/mysql/add_shared_vault_uuid_to_items
```