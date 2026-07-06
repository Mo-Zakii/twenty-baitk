import { BAITK_OBJECT_NAME_SET } from 'src/constants/baitk-object-names.constants';
import { cleanupBaitkWorkspaceMetadataViaApi } from 'src/utils/cleanup-baitk-workspace-metadata-via-api.util';
import { cleanupBaitkWorkspaceMetadataViaDatabase } from 'src/utils/cleanup-baitk-workspace-metadata-via-database.util';
import { postMetadataGraphql } from 'src/utils/baitk-graphql.util';
import { removeNonBaitkObjects } from 'src/utils/remove-non-baitk-objects.util';

type ObjectRow = {
  id: string;
  nameSingular: string;
  isActive: boolean;
};

const listObjects = async (): Promise<ObjectRow[]> => {
  const objectsData = await postMetadataGraphql<{
    objects: { edges: { node: ObjectRow }[] };
  }>(
    `{ objects(paging:{first:200}) { edges { node { id nameSingular isActive } } } }`,
  );

  return objectsData.objects.edges.map((edge) => edge.node);
};

const activateBaitkObjects = async (): Promise<string[]> => {
  const activatedObjectNames: string[] = [];
  const objects = await listObjects();

  for (const objectMetadata of objects) {
    if (
      !BAITK_OBJECT_NAME_SET.has(objectMetadata.nameSingular) ||
      objectMetadata.isActive
    ) {
      continue;
    }

    await postMetadataGraphql(
      `mutation ActivateObject($id: UUID!) {
        updateOneObject(input: {
          id: $id
          update: { isActive: true }
        }) {
          id
          nameSingular
          isActive
        }
      }`,
      { id: objectMetadata.id },
    );

    activatedObjectNames.push(objectMetadata.nameSingular);
  }

  return activatedObjectNames;
};

export const configureBaitkWorkspace = async (): Promise<void> => {
  await removeNonBaitkObjects();

  try {
    await cleanupBaitkWorkspaceMetadataViaApi();
  } catch (apiError) {
    console.warn(
      'Metadata API cleanup failed — falling back to direct database cleanup',
      apiError,
    );
    await cleanupBaitkWorkspaceMetadataViaDatabase();
  }

  const activatedObjectNames = await activateBaitkObjects();

  if (activatedObjectNames.length > 0) {
    console.log(`Activated BAITK objects: ${activatedObjectNames.join(', ')}`);
  }
};
