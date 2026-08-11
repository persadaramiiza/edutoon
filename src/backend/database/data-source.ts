  import { DataSource, DataSourceOptions } from 'typeorm';
  import { databaseEntities } from './entities';
  import { InitialSchema1723348800000 } from './migrations/1723348800000-InitialSchema';

  export function createDataSourceOptions(): DataSourceOptions {
    const sslEnabled = process.env.DB_SSL === 'true';

    return {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: databaseEntities,
      migrations: [InitialSchema1723348800000],
      synchronize: false,
      migrationsRun: false,
      logging: false,
      ssl: sslEnabled
        ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
        : false,
    };
  }

  export const AppDataSource = new DataSource(createDataSourceOptions());
