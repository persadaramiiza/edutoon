import { AppDataSource } from './data-source';

async function run() {
  await AppDataSource.initialize();
  try {
    await AppDataSource.undoLastMigration({ transaction: 'none' });
    console.log('Reverted the last migration.');
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((error) => {
  console.error(
    'Migration revert failed:',
    error instanceof Error ? error.message : 'unknown error',
  );
  process.exitCode = 1;
});
