import { ROLE_IDS } from 'src/constants/uuids';
import { MANAGER_ROLE_LABEL } from 'src/roles/manager.role';
import { SALES_ROLE_LABEL } from 'src/roles/sales.role';
import { TEAM_LEADER_ROLE_LABEL } from 'src/roles/team-leader.role';
import { postMetadataGraphql } from 'src/utils/baitk-graphql.util';

type RoleRow = {
  id: string;
  label: string;
};

async function findFieldByName(
  objectId: string,
  objectName: string,
  fieldName: string,
): Promise<string> {
  let after: string | null = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pagingArg = after
      ? `paging:{first:200, after:"${after}"}`
      : `paging:{first:200}`;

    const query = `{
      object(id: "${objectId}") {
        fields(${pagingArg}) {
          edges { node { id name } }
          pageInfo { hasNextPage endCursor }
        }
      }
    }`;

    const data = await postMetadataGraphql<{
      object: {
        fields: {
          edges: { node: { id: string; name: string } }[];
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
        };
      };
    }>(query);

    const match = data.object.fields.edges.find(
      (edge) => edge.node.name === fieldName,
    );

    if (match) {
      return match.node.id;
    }

    if (!data.object.fields.pageInfo.hasNextPage) {
      throw new Error(
        `Field "${fieldName}" not found on object "${objectName}"`,
      );
    }

    after = data.object.fields.pageInfo.endCursor;
  }
}

const upsertLeadPredicate = async ({
  roleId,
  leadObjectId,
  workspaceMemberIdFieldId,
  scopeFieldName,
}: {
  roleId: string;
  leadObjectId: string;
  workspaceMemberIdFieldId: string;
  scopeFieldName: string;
}) => {
  const scopeFieldId = await findFieldByName(
    leadObjectId,
    'lead',
    scopeFieldName,
  );

  const mutation = `
    mutation UpsertRLSPredicates($input: UpsertRowLevelPermissionPredicatesInput!) {
      upsertRowLevelPermissionPredicates(input: $input) {
        predicates { id fieldMetadataId operand }
      }
    }
  `;

  await postMetadataGraphql(mutation, {
    input: {
      roleId,
      objectMetadataId: leadObjectId,
      predicates: [
        {
          fieldMetadataId: scopeFieldId,
          operand: 'IS',
          workspaceMemberFieldMetadataId: workspaceMemberIdFieldId,
        },
      ],
      predicateGroups: [],
    },
  });
};

export const configureBaitkRowLevelSecurity = async (): Promise<void> => {
  const objectsData = await postMetadataGraphql<{
    objects: { edges: { node: { id: string; nameSingular: string } }[] };
  }>(`{ objects(paging:{first:100}) { edges { node { id nameSingular } } } }`);

  const objectIdByName = new Map(
    objectsData.objects.edges.map((edge) => [
      edge.node.nameSingular,
      edge.node.id,
    ]),
  );

  const leadObjectId = objectIdByName.get('lead');
  const workspaceMemberObjectId = objectIdByName.get('workspaceMember');

  if (!leadObjectId || !workspaceMemberObjectId) {
    throw new Error(
      'lead or workspaceMember object not found — publish BAITK app first',
    );
  }

  const workspaceMemberIdFieldId = await findFieldByName(
    workspaceMemberObjectId,
    'workspaceMember',
    'id',
  );

  const rolesData = await postMetadataGraphql<{ getRoles: RoleRow[] }>(
    `{ getRoles { id label } }`,
  );

  const roleByLabel = new Map(
    rolesData.getRoles.map((role) => [role.label, role.id]),
  );

  const salesRoleId = roleByLabel.get(SALES_ROLE_LABEL);
  const teamLeaderRoleId = roleByLabel.get(TEAM_LEADER_ROLE_LABEL);
  const managerRoleId = roleByLabel.get(MANAGER_ROLE_LABEL);

  if (!salesRoleId || !teamLeaderRoleId || !managerRoleId) {
    throw new Error(
      'Sales, Team Leader, or Manager role missing — publish app and sync roles first',
    );
  }

  console.log(
    `[baitk-rls] role ids: sales=${salesRoleId}, tl=${teamLeaderRoleId}, mgr=${managerRoleId}`,
  );
  console.log(
    `[baitk-rls] manifest role ids: sales=${ROLE_IDS.sales}, tl=${ROLE_IDS.teamLeader}, mgr=${ROLE_IDS.manager}`,
  );

  await upsertLeadPredicate({
    roleId: salesRoleId,
    leadObjectId,
    workspaceMemberIdFieldId,
    scopeFieldName: 'assignee',
  });

  await upsertLeadPredicate({
    roleId: teamLeaderRoleId,
    leadObjectId,
    workspaceMemberIdFieldId,
    scopeFieldName: 'teamLeaderScope',
  });

  await upsertLeadPredicate({
    roleId: managerRoleId,
    leadObjectId,
    workspaceMemberIdFieldId,
    scopeFieldName: 'teamManagerScope',
  });
};
