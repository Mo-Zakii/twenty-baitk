import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

import { removeNonBaitkObjectsViaApi } from 'src/utils/remove-non-baitk-objects-via-api.util';

const DEFAULT_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const removeNonBaitkObjectsViaCli = (workspaceId: string): void => {
  const repoRoot = resolve(__dirname, '../../../../..');
  const serverDir = resolve(repoRoot, 'packages/twenty-server');
  const commandPath = resolve(serverDir, 'dist/command/command.js');

  if (!existsSync(commandPath)) {
    throw new Error(
      'twenty-server CLI is not built. Run: npx nx build twenty-server',
    );
  }

  execSync(
    `node dist/command/command.js workspace:baitk-remove-non-baitk-objects --workspace-id ${workspaceId}`,
    {
      cwd: serverDir,
      stdio: 'inherit',
    },
  );
};

export const removeNonBaitkObjects = async (): Promise<void> => {
  const workspaceId =
    process.env.BAITK_WORKSPACE_ID ?? DEFAULT_WORKSPACE_ID;
  const preferCli = process.env.BAITK_USE_SERVER_CLI === 'true';

  if (preferCli) {
    removeNonBaitkObjectsViaCli(workspaceId);

    return;
  }

  try {
    const removedObjectNames = await removeNonBaitkObjectsViaApi();

    if (removedObjectNames.length === 0) {
      console.log('No non-BAITK objects to remove');
    }

    return;
  } catch (apiError) {
    const repoRoot = resolve(__dirname, '../../../../..');
    const commandPath = resolve(
      repoRoot,
      'packages/twenty-server/dist/command/command.js',
    );

    if (!existsSync(commandPath)) {
      throw apiError;
    }

    console.warn(
      'Metadata API object removal failed — falling back to twenty-server CLI',
      apiError,
    );
    removeNonBaitkObjectsViaCli(workspaceId);
  }
};
