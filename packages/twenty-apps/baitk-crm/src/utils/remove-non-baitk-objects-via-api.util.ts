import { BAITK_OBJECT_NAME_SET } from 'src/constants/baitk-object-names.constants';
import { postMetadataGraphql } from 'src/utils/baitk-graphql.util';
import { shouldRemoveNonBaitkObject } from 'src/utils/should-remove-non-baitk-object.util';

type ObjectRow = {
  id: string;
  nameSingular: string;
  isActive: boolean;
  isSystem: boolean;
};

const MAX_DELETION_PASSES = 20;

const listObjects = async (): Promise<ObjectRow[]> => {
  const objectsData = await postMetadataGraphql<{
    objects: { edges: { node: ObjectRow }[] };
  }>(
    `{ objects(paging:{first:200}) { edges { node { id nameSingular isActive isSystem } } } }`,
  );

  return objectsData.objects.edges.map((edge) => edge.node);
};

const deleteObject = async (objectId: string): Promise<void> => {
  await postMetadataGraphql(
    `mutation DeleteObject($id: UUID!) {
      deleteOneObject(input: { id: $id }) {
        id
        nameSingular
      }
    }`,
    { id: objectId },
  );
};

export const removeNonBaitkObjectsViaApi = async (): Promise<string[]> => {
  const removedObjectNames: string[] = [];

  for (let pass = 1; pass <= MAX_DELETION_PASSES; pass += 1) {
    const objects = await listObjects();
    const objectsToRemove = objects.filter(shouldRemoveNonBaitkObject);

    if (objectsToRemove.length === 0) {
      break;
    }

    for (const objectMetadata of objectsToRemove) {
      await deleteObject(objectMetadata.id);
      removedObjectNames.push(objectMetadata.nameSingular);
      console.log(
        `Removed object ${objectMetadata.nameSingular} (${objectMetadata.id})`,
      );
    }
  }

  const remainingObjects = await listObjects();
  const unexpectedObjects = remainingObjects.filter(
    (objectMetadata) =>
      !BAITK_OBJECT_NAME_SET.has(objectMetadata.nameSingular) &&
      shouldRemoveNonBaitkObject(objectMetadata),
  );

  if (unexpectedObjects.length > 0) {
    throw new Error(
      `Failed to remove objects: ${unexpectedObjects.map((object) => object.nameSingular).join(', ')}`,
    );
  }

  return removedObjectNames;
};
