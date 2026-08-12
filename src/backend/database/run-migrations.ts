import { AppDataSource } from './data-source';

async function run() {
  await AppDataSource.initialize();
  try {
    const migrations = await AppDataSource.runMigrations({
      transaction: 'none',
    });
    console.log(`Applied ${migrations.length} migration(s).`);
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((error) => {
  console.error(
    'Migration failed:',
    error instanceof Error ? error.message : 'unknown error',
  );
  process.exitCode = 1;
});
