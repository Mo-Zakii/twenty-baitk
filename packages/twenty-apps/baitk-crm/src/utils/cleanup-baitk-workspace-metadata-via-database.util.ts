import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEMO_COMMAND_MENU_ITEM_LABELS,
  TWENTY_WORKFLOWS_NAV_UNIVERSAL_IDENTIFIER,
} from 'src/constants/baitk-cleanup.constants';

const DEFAULT_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

export const cleanupBaitkWorkspaceMetadataViaDatabase =
  async (): Promise<void> => {
    const workspaceId =
      process.env.BAITK_WORKSPACE_ID ?? DEFAULT_WORKSPACE_ID;
    const repoRoot = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../../../..',
    );
    const require = createRequire(import.meta.url);
    const { Client } = require(resolve(repoRoot, 'node_modules/pg'));

    const pgDatabaseUrl =
      process.env.PG_DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/default';

    const client = new Client({ connectionString: pgDatabaseUrl });

    await client.connect();

    try {
      const deletedWorkflowCommands = await client.query(
        `DELETE FROM core."commandMenuItem"
       WHERE "workspaceId" = $1
         AND ("workflowVersionId" IS NOT NULL
           OR "engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION')
       RETURNING id, label`,
        [workspaceId],
      );

      for (const command of deletedWorkflowCommands.rows) {
        console.log(
          `Deleted workflow command ${command.label} (${command.id})`,
        );
      }

      const deletedNavigationItems = await client.query(
        `DELETE FROM core."navigationMenuItem"
       WHERE "workspaceId" = $1
         AND "universalIdentifier" = $2
       RETURNING id, name`,
        [workspaceId, TWENTY_WORKFLOWS_NAV_UNIVERSAL_IDENTIFIER],
      );

      for (const navigationItem of deletedNavigationItems.rows) {
        console.log(
          `Deleted navigation item ${navigationItem.name} (${navigationItem.id})`,
        );
      }

      const deletedOrphanAvailabilityCommands = await client.query(
        `DELETE FROM core."commandMenuItem" commandMenuItem
       WHERE commandMenuItem."workspaceId" = $1
         AND commandMenuItem."availabilityObjectMetadataId" IS NOT NULL
         AND NOT EXISTS (
           SELECT 1
           FROM core."objectMetadata" objectMetadata
           WHERE objectMetadata.id = commandMenuItem."availabilityObjectMetadataId"
         )
       RETURNING commandMenuItem.id, commandMenuItem.label`,
        [workspaceId],
      );

      for (const command of deletedOrphanAvailabilityCommands.rows) {
        console.log(
          `Deleted command with missing object metadata ${command.label} (${command.id})`,
        );
      }

      const deletedDemoCommands = await client.query(
        `DELETE FROM core."commandMenuItem"
       WHERE "workspaceId" = $1
         AND label = ANY($2::text[])
       RETURNING id, label`,
        [workspaceId, DEMO_COMMAND_MENU_ITEM_LABELS],
      );

      for (const command of deletedDemoCommands.rows) {
        console.log(`Deleted demo command ${command.label} (${command.id})`);
      }
    } finally {
      await client.end();
    }
  };
