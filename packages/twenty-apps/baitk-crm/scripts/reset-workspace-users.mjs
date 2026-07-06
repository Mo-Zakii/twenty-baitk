/**
 * Dev cleanup: keep Tim only in Apple + YCombinator workspaces,
 * promote Tim to Admin, rename Apple workspace to BAITK CRM,
 * create a BAITK CRM owner user.
 *
 * Run: node scripts/reset-workspace-users.mjs
 */
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import pg from 'pg';

const { Client } = pg;

const PG_URL =
  process.env.PG_DATABASE_URL ??
  'postgres://postgres:postgres@localhost:5432/default';

const TIM_USER_ID = '20202020-9e3b-46d4-a556-88b9ddc2b034';
const TIM_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';

const APPLE_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const APPLE_SCHEMA = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const YC_WORKSPACE_ID = '3b8e6458-5fc1-4e63-8563-008ccddaa6db';
const YC_SCHEMA = 'workspace_3ixj3i1a5avy16ptijtb3lae3';

const TWENTY_STANDARD_APPLICATION_ID = '58ad1638-47f5-405d-bcbc-d692a47f522e';
const ADMIN_ROLE_ID = '732ea8b1-e7c8-4d00-b1e9-327088131b6b';
const BAITK_OWNER_ROLE_ID = '40940b42-b10d-43ee-8d21-3bf238417d3b';

const BAITK_CRM_EMAIL = 'baitk-crm@baitk.local';
const BAITK_CRM_PASSWORD = 'BaitkCrm2026!';

const tableExists = async (client, schema, tableName) => {
  const result = await client.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = $1 AND table_name = $2`,
    [schema, tableName],
  );

  return result.rowCount > 0;
};

const nullMemberReferences = async (client, schema, memberIds) => {
  if (memberIds.length === 0) {
    return;
  }

  const idList = memberIds.map((id) => `'${id}'`).join(',');
  const tableExistsCache = new Map();

  const hasTable = async (tableName) => {
    if (tableExistsCache.has(tableName)) {
      return tableExistsCache.get(tableName);
    }

    const exists = await tableExists(client, schema, tableName);
    tableExistsCache.set(tableName, exists);

    return exists;
  };

  const tableUpdates = [
    { table: '_lead', statement: `UPDATE "${schema}"."_lead" SET "assigneeId" = NULL WHERE "assigneeId" IN (${idList})` },
    { table: '_lead', statement: `UPDATE "${schema}"."_lead" SET "teamLeaderScopeId" = NULL WHERE "teamLeaderScopeId" IN (${idList})` },
    { table: '_lead', statement: `UPDATE "${schema}"."_lead" SET "teamManagerScopeId" = NULL WHERE "teamManagerScopeId" IN (${idList})` },
    { table: '_distributionQueueEntry', statement: `DELETE FROM "${schema}"."_distributionQueueEntry" WHERE "assigneeId" IN (${idList})` },
    { table: '_baitkNotification', statement: `DELETE FROM "${schema}"."_baitkNotification" WHERE "recipientId" IN (${idList})` },
    { table: '_baitkTeam', statement: `UPDATE "${schema}"."_baitkTeam" SET "leaderId" = NULL WHERE "leaderId" IN (${idList})` },
    { table: '_baitkTeam', statement: `UPDATE "${schema}"."_baitkTeam" SET "managerId" = NULL WHERE "managerId" IN (${idList})` },
    { table: 'task', statement: `UPDATE "${schema}"."task" SET "assigneeId" = NULL WHERE "assigneeId" IN (${idList})` },
    { table: 'company', statement: `UPDATE "${schema}"."company" SET "accountOwnerId" = NULL WHERE "accountOwnerId" IN (${idList})` },
    { table: 'opportunity', statement: `UPDATE "${schema}"."opportunity" SET "ownerId" = NULL WHERE "ownerId" IN (${idList})` },
    { table: 'blocklist', statement: `UPDATE "${schema}"."blocklist" SET "workspaceMemberId" = NULL WHERE "workspaceMemberId" IN (${idList})` },
    { table: 'calendarEventParticipant', statement: `UPDATE "${schema}"."calendarEventParticipant" SET "workspaceMemberId" = NULL WHERE "workspaceMemberId" IN (${idList})` },
    { table: 'messageParticipant', statement: `UPDATE "${schema}"."messageParticipant" SET "workspaceMemberId" = NULL WHERE "workspaceMemberId" IN (${idList})` },
    { table: 'timelineActivity', statement: `UPDATE "${schema}"."timelineActivity" SET "workspaceMemberId" = NULL WHERE "workspaceMemberId" IN (${idList})` },
  ];

  for (const { table, statement } of tableUpdates) {
    if (!(await hasTable(table))) {
      continue;
    }

    await client.query(statement);
  }
};

const cleanWorkspace = async (
  client,
  { workspaceId, schema, keepUserId },
) => {
  const membersResult = await client.query(
    `SELECT id, "userId" FROM "${schema}"."workspaceMember" WHERE "userId" != $1`,
    [keepUserId],
  );

  const memberIds = membersResult.rows.map((row) => row.id);
  const userIds = membersResult.rows.map((row) => row.userId);

  console.log(
    `[${workspaceId}] removing ${memberIds.length} workspace members...`,
  );

  await nullMemberReferences(client, schema, memberIds);

  const userWorkspacesResult = await client.query(
    `SELECT id FROM core."userWorkspace" WHERE "workspaceId" = $1 AND "userId" != $2`,
    [workspaceId, keepUserId],
  );

  const userWorkspaceIds = userWorkspacesResult.rows.map((row) => row.id);

  if (userWorkspaceIds.length > 0) {
    await client.query(
      `DELETE FROM core."roleTarget" WHERE "userWorkspaceId" = ANY($1::uuid[])`,
      [userWorkspaceIds],
    );
  }

  await client.query(
    `DELETE FROM "${schema}"."workspaceMember" WHERE "userId" != $1`,
    [keepUserId],
  );

  await client.query(
    `DELETE FROM core."userWorkspace" WHERE "workspaceId" = $1 AND "userId" != $2`,
    [workspaceId, keepUserId],
  );

  if (userIds.length > 0) {
    await client.query(
      `DELETE FROM core."user" u
       WHERE u.id = ANY($1::uuid[])
         AND NOT EXISTS (
           SELECT 1 FROM core."userWorkspace" uw WHERE uw."userId" = u.id
         )`,
      [userIds],
    );
  }
};

const assignRole = async (
  client,
  { workspaceId, userWorkspaceId, roleId },
) => {
  await client.query(
    `DELETE FROM core."roleTarget" WHERE "userWorkspaceId" = $1`,
    [userWorkspaceId],
  );

  const roleTargetId = randomUUID();

  await client.query(
    `INSERT INTO core."roleTarget" (
      id, "workspaceId", "roleId", "userWorkspaceId", "applicationId",
      "createdAt", "updatedAt", "universalIdentifier"
    ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6)`,
    [
      roleTargetId,
      workspaceId,
      roleId,
      userWorkspaceId,
      TWENTY_STANDARD_APPLICATION_ID,
      randomUUID(),
    ],
  );
};

const createBaitkCrmUser = async (client) => {
  const existingUser = await client.query(
    `SELECT id FROM core."user" WHERE email = $1`,
    [BAITK_CRM_EMAIL],
  );

  if (existingUser.rows.length > 0) {
    console.log('BAITK CRM user already exists, skipping create.');
    return;
  }

  const userId = randomUUID();
  const userWorkspaceId = randomUUID();
  const memberId = randomUUID();
  const passwordHash = await bcrypt.hash(BAITK_CRM_PASSWORD, 10);
  const now = new Date();

  await client.query(
    `INSERT INTO core."user" (
      id, "firstName", "lastName", email, "passwordHash",
      "canImpersonate", "canAccessFullAdminPanel", "isEmailVerified",
      "createdAt", "updatedAt"
    ) VALUES ($1, 'BAITK', 'CRM', $2, $3, false, false, true, $4, $4)`,
    [userId, BAITK_CRM_EMAIL, passwordHash, now],
  );

  await client.query(
    `INSERT INTO core."userWorkspace" (
      id, "userId", "workspaceId", "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, $4, $4)`,
    [userWorkspaceId, userId, APPLE_WORKSPACE_ID, now],
  );

  await client.query(
    `INSERT INTO "${APPLE_SCHEMA}"."workspaceMember" (
      id, "createdAt", "updatedAt", position,
      "nameFirstName", "nameLastName", "colorScheme", locale,
      "userEmail", "calendarStartDay", "userId", "timeZone",
      "dateFormat", "timeFormat", "numberFormat",
      "createdBySource", "createdByName", "updatedBySource", "updatedByName"
    ) VALUES (
      $1, $2, $2, 1,
      'BAITK', 'CRM', 'Light', 'en',
      $3, 7, $4, 'system',
      'SYSTEM', 'SYSTEM', 'SYSTEM',
      'MANUAL', 'System', 'MANUAL', 'System'
    )`,
    [memberId, now, BAITK_CRM_EMAIL, userId],
  );

  await assignRole(client, {
    workspaceId: APPLE_WORKSPACE_ID,
    userWorkspaceId,
    roleId: BAITK_OWNER_ROLE_ID,
  });

  console.log(`Created BAITK CRM user: ${BAITK_CRM_EMAIL}`);
  console.log(`Password: ${BAITK_CRM_PASSWORD}`);
};

const main = async () => {
  const client = new Client({ connectionString: PG_URL });

  await client.connect();

  try {
    await client.query('BEGIN');

    await cleanWorkspace(client, {
      workspaceId: APPLE_WORKSPACE_ID,
      schema: APPLE_SCHEMA,
      keepUserId: TIM_USER_ID,
    });

    await cleanWorkspace(client, {
      workspaceId: YC_WORKSPACE_ID,
      schema: YC_SCHEMA,
      keepUserId: TIM_USER_ID,
    });

    const timUserWorkspace = await client.query(
      `SELECT id FROM core."userWorkspace"
       WHERE "userId" = $1 AND "workspaceId" = $2`,
      [TIM_USER_ID, APPLE_WORKSPACE_ID],
    );

    const timUserWorkspaceId = timUserWorkspace.rows[0]?.id;

    if (timUserWorkspaceId) {
      await assignRole(client, {
        workspaceId: APPLE_WORKSPACE_ID,
        userWorkspaceId: timUserWorkspaceId,
        roleId: ADMIN_ROLE_ID,
      });
    }

    const timYcUserWorkspace = await client.query(
      `SELECT id FROM core."userWorkspace"
       WHERE "userId" = $1 AND "workspaceId" = $2`,
      [TIM_USER_ID, YC_WORKSPACE_ID],
    );

    if (timYcUserWorkspace.rows[0]?.id) {
      await assignRole(client, {
        workspaceId: YC_WORKSPACE_ID,
        userWorkspaceId: timYcUserWorkspace.rows[0].id,
        roleId: ADMIN_ROLE_ID,
      });
    }

    await client.query(
      `UPDATE core.workspace SET "displayName" = 'BAITK CRM', "updatedAt" = NOW()
       WHERE id = $1`,
      [APPLE_WORKSPACE_ID],
    );

    await createBaitkCrmUser(client);

    await client.query('COMMIT');

    const counts = await client.query(
      `SELECT w."displayName", COUNT(uw.id)::int AS members
       FROM core.workspace w
       LEFT JOIN core."userWorkspace" uw ON uw."workspaceId" = w.id
       WHERE w.id IN ($1, $2)
       GROUP BY w.id, w."displayName"`,
      [APPLE_WORKSPACE_ID, YC_WORKSPACE_ID],
    );

    console.log('\nDone. Workspace member counts:');
    for (const row of counts.rows) {
      console.log(`  ${row.displayName}: ${row.members} user(s)`);
    }
    console.log('\nTim login: tim@apple.dev / tim@apple.dev');
    console.log(`BAITK CRM login: ${BAITK_CRM_EMAIL} / ${BAITK_CRM_PASSWORD}`);
    console.log('\nRestart twenty-server or wait for cache refresh if UI looks stale.');
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
