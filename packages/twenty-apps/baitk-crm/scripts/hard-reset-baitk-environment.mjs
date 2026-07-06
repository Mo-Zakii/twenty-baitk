/**
 * Hard reset dev environment:
 * - Single workspace "BAITK AI CRM"
 * - Single user mo.zakieg@gmail.com / BAITK@012 (server admin)
 * - Removes Tim, mock users, extra workspaces, and seeded CRM data
 *
 * Run after: npx nx database:reset twenty-server --configuration=no-seed
 *            npx nx command-no-deps twenty-server -- workspace:seed:dev --light
 */
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../../..');
const require = createRequire(import.meta.url);

const bcrypt = require(resolve(repoRoot, 'node_modules/bcrypt'));
const pg = require(resolve(repoRoot, 'node_modules/pg'));

const { Client } = pg;

const PG_URL =
  process.env.PG_DATABASE_URL ??
  'postgres://postgres:postgres@localhost:5432/default';

const KEEP_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const PRIMARY_USER_ID = '20202020-9e3b-46d4-a556-88b9ddc2b034';

const MO_EMAIL = 'mo.zakieg@gmail.com';
const MO_PASSWORD = 'BAITK@012';
const WORKSPACE_DISPLAY_NAME = 'BAITK AI CRM';
const WORKSPACE_SUBDOMAIN = 'baitk-ai-crm';

const assignRoleByLabel = async (
  client,
  { workspaceId, userWorkspaceId, roleLabel },
) => {
  const roleResult = await client.query(
    `SELECT id FROM core."role"
     WHERE "workspaceId" = $1 AND label = $2
     LIMIT 1`,
    [workspaceId, roleLabel],
  );

  const roleId = roleResult.rows[0]?.id;

  if (!roleId) {
    console.warn(`Role "${roleLabel}" not found in workspace ${workspaceId}`);
    return;
  }

  const existing = await client.query(
    `SELECT id FROM core."roleTarget"
     WHERE "userWorkspaceId" = $1 AND "roleId" = $2`,
    [userWorkspaceId, roleId],
  );

  if (existing.rows.length > 0) {
    return;
  }

  const applicationResult = await client.query(
    `SELECT id FROM core.application
     WHERE "workspaceId" = $1
     ORDER BY "createdAt" ASC
     LIMIT 1`,
    [workspaceId],
  );

  const applicationId = applicationResult.rows[0]?.id;

  if (!applicationId) {
    console.warn(`No application found for workspace ${workspaceId}`);
    return;
  }

  await client.query(
    `INSERT INTO core."roleTarget" (
      id, "workspaceId", "roleId", "userWorkspaceId", "applicationId",
      "createdAt", "updatedAt", "universalIdentifier"
    ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6)`,
    [
      randomUUID(),
      workspaceId,
      roleId,
      userWorkspaceId,
      applicationId,
      randomUUID(),
    ],
  );
};

const uuidToBase36 = (uuid) => {
  const hexString = uuid.replace(/-/g, '');
  const base10Number = BigInt(`0x${hexString}`);

  return base10Number.toString(36);
};

const getWorkspaceSchemaName = (workspaceId) =>
  `workspace_${uuidToBase36(workspaceId)}`;

const getCoreTablesWithWorkspaceId = async (client) => {
  const result = await client.query(
    `SELECT DISTINCT table_name
     FROM information_schema.columns
     WHERE table_schema = 'core'
       AND column_name = 'workspaceId'`,
  );

  return result.rows.map((row) => row.table_name);
};

const deleteWorkspaceRecords = async (client, workspaceId) => {
  const schemaName = getWorkspaceSchemaName(workspaceId);

  console.log(`Deleting workspace ${workspaceId} (${schemaName})...`);

  const userWorkspaces = await client.query(
    `SELECT id FROM core."userWorkspace" WHERE "workspaceId" = $1`,
    [workspaceId],
  );

  const userWorkspaceIds = userWorkspaces.rows.map((row) => row.id);

  if (userWorkspaceIds.length > 0) {
    await client.query(
      `DELETE FROM core."roleTarget" WHERE "userWorkspaceId" = ANY($1::uuid[])`,
      [userWorkspaceIds],
    );
    await client.query(
      `DELETE FROM core."userWorkspace" WHERE id = ANY($1::uuid[])`,
      [userWorkspaceIds],
    );
  }

  const coreTables = await getCoreTablesWithWorkspaceId(client);

  for (const tableName of coreTables) {
    if (tableName === 'workspace') {
      continue;
    }

    await client.query(
      `DELETE FROM core."${tableName}" WHERE "workspaceId" = $1`,
      [workspaceId],
    );
  }

  await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  await client.query(`DELETE FROM core.workspace WHERE id = $1`, [workspaceId]);
};

const clearWorkspaceMockData = async (client, schemaName, keepUserId) => {
  const tables = await client.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = $1 AND table_type = 'BASE TABLE'`,
    [schemaName],
  );

  for (const { table_name: tableName } of tables.rows) {
    if (tableName === 'workspaceMember') {
      await client.query(
        `DELETE FROM "${schemaName}"."workspaceMember" WHERE "userId" != $1`,
        [keepUserId],
      );
      continue;
    }

    await client.query(
      `TRUNCATE TABLE "${schemaName}"."${tableName}" CASCADE`,
    );
  }
};

const main = async () => {
  const client = new Client({ connectionString: PG_URL });

  await client.connect();

  try {
    await client.query('BEGIN');

    const workspaces = await client.query(
      `SELECT id, "displayName" FROM core.workspace ORDER BY "createdAt"`,
    );

    for (const workspace of workspaces.rows) {
      if (workspace.id === KEEP_WORKSPACE_ID) {
        continue;
      }

      await deleteWorkspaceRecords(client, workspace.id);
    }

    const keepSchema = getWorkspaceSchemaName(KEEP_WORKSPACE_ID);
    const passwordHash = await bcrypt.hash(MO_PASSWORD, 10);

    await client.query(
      `UPDATE core."user"
       SET "firstName" = 'Mo',
           "lastName" = 'Zakieg',
           email = $1,
           "passwordHash" = $2,
           "canImpersonate" = true,
           "canAccessFullAdminPanel" = true,
           "isEmailVerified" = true,
           "updatedAt" = NOW()
       WHERE id = $3`,
      [MO_EMAIL, passwordHash, PRIMARY_USER_ID],
    );

    await client.query(
      `DELETE FROM core."user"
       WHERE id != $1
         AND NOT EXISTS (
           SELECT 1 FROM core."userWorkspace" uw WHERE uw."userId" = core."user".id
         )`,
      [PRIMARY_USER_ID],
    );

    const extraUserWorkspaces = await client.query(
      `SELECT id, "userId" FROM core."userWorkspace"
       WHERE "workspaceId" = $1 AND "userId" != $2`,
      [KEEP_WORKSPACE_ID, PRIMARY_USER_ID],
    );

    const extraUserWorkspaceIds = extraUserWorkspaces.rows.map((row) => row.id);

    if (extraUserWorkspaceIds.length > 0) {
      await client.query(
        `DELETE FROM core."roleTarget" WHERE "userWorkspaceId" = ANY($1::uuid[])`,
        [extraUserWorkspaceIds],
      );
      await client.query(
        `DELETE FROM core."userWorkspace" WHERE id = ANY($1::uuid[])`,
        [extraUserWorkspaceIds],
      );
    }

    const extraUserIds = extraUserWorkspaces.rows.map((row) => row.userId);

    await client.query(
      `DELETE FROM "${keepSchema}"."workspaceMember" WHERE "userId" != $1`,
      [PRIMARY_USER_ID],
    );

    if (extraUserIds.length > 0) {
      await client.query(
        `DELETE FROM core."user" u
         WHERE u.id = ANY($1::uuid[])
           AND NOT EXISTS (
             SELECT 1 FROM core."userWorkspace" uw WHERE uw."userId" = u.id
           )`,
        [extraUserIds],
      );
    }

    await client.query(
      `DELETE FROM core."user"
       WHERE id != $1
         AND NOT EXISTS (
           SELECT 1 FROM core."userWorkspace" uw WHERE uw."userId" = core."user".id
         )`,
      [PRIMARY_USER_ID],
    );

    await clearWorkspaceMockData(client, keepSchema, PRIMARY_USER_ID);

    await client.query(
      `UPDATE "${keepSchema}"."workspaceMember"
       SET "nameFirstName" = 'Mo',
           "nameLastName" = 'Zakieg',
           "userEmail" = $1,
           "updatedAt" = NOW()
       WHERE "userId" = $2`,
      [MO_EMAIL, PRIMARY_USER_ID],
    );

    await client.query(
      `UPDATE core.workspace
       SET "displayName" = $1,
           subdomain = $2,
           "updatedAt" = NOW()
       WHERE id = $3`,
      [WORKSPACE_DISPLAY_NAME, WORKSPACE_SUBDOMAIN, KEEP_WORKSPACE_ID],
    );

    const userWorkspace = await client.query(
      `SELECT id FROM core."userWorkspace"
       WHERE "userId" = $1 AND "workspaceId" = $2`,
      [PRIMARY_USER_ID, KEEP_WORKSPACE_ID],
    );

    const userWorkspaceId = userWorkspace.rows[0]?.id;

    if (userWorkspaceId) {
      await assignRoleByLabel(client, {
        workspaceId: KEEP_WORKSPACE_ID,
        userWorkspaceId,
        roleLabel: 'Admin',
      });
    }

    await client.query('COMMIT');

    const summary = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM core.workspace) AS workspaces,
         (SELECT COUNT(*)::int FROM core."user") AS users,
         (SELECT COUNT(*)::int FROM core."userWorkspace") AS memberships`,
    );

    console.log('\nHard reset complete.');
    console.log(`Workspace: ${WORKSPACE_DISPLAY_NAME}`);
    console.log(`Login: ${MO_EMAIL} / ${MO_PASSWORD}`);
    console.log(`Workspaces: ${summary.rows[0].workspaces}`);
    console.log(`Users: ${summary.rows[0].users}`);
    console.log(
      '\nNext: restart twenty-server, generate an API key, then run yarn setup',
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
