import { BAITK_OBJECT_NAME_SET } from 'src/constants/baitk-object-names.constants';
import { FORCE_REMOVE_OBJECT_NAME_SET } from 'src/constants/baitk-cleanup.constants';

type ObjectMetadataRow = {
  nameSingular: string;
  isSystem: boolean;
};

export const shouldRemoveNonBaitkObject = (
  objectMetadata: ObjectMetadataRow,
): boolean => {
  if (BAITK_OBJECT_NAME_SET.has(objectMetadata.nameSingular)) {
    return false;
  }

  if (FORCE_REMOVE_OBJECT_NAME_SET.has(objectMetadata.nameSingular)) {
    return true;
  }

  if (objectMetadata.isSystem) {
    return false;
  }

  return true;
};
