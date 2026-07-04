import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const isComputedFlatFieldMetadata = (
  flatFieldMetadata: Pick<FlatFieldMetadata, 'computation'>,
): boolean => isDefined(flatFieldMetadata.computation);
