import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

export const getFieldComputedExpression = (
  computation: FieldMetadataItem['computation'] | FieldMetadata['computation'],
): string | null => {
  if (isDefined(computation) && computation.mode === 'EXPRESSION') {
    return computation.expression;
  }

  return null;
};
