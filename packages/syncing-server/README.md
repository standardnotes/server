## Migrations

### Generating a migration

```
yarn build && yarn typeorm migration:generate -d dist/src/Bootstrap/DataSource.js migrations/mysql/add_group_uuid_to_items
```