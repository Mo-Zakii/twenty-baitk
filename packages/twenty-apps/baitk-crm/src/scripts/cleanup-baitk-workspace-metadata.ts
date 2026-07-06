import { config } from 'dotenv';

config({ path: process.env.ENV_FILE ?? '.env.local' });

import { cleanupBaitkWorkspaceMetadataViaApi } from 'src/utils/cleanup-baitk-workspace-metadata-via-api.util';
import { cleanupBaitkWorkspaceMetadataViaDatabase } from 'src/utils/cleanup-baitk-workspace-metadata-via-database.util';

const main = async (): Promise<void> => {
  try {
    await cleanupBaitkWorkspaceMetadataViaApi();
    console.log('Metadata cleanup complete (API)');
  } catch (apiError) {
    console.warn('API cleanup failed — using database fallback', apiError);
    await cleanupBaitkWorkspaceMetadataViaDatabase();
    console.log('Metadata cleanup complete (database)');
  }
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
