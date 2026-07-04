import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getFlatFieldMetadataComputedExpression = (
  computation: FieldMetadataComputation | null | undefined,
): string | null => {
  if (isDefined(computation) && computation.mode === 'EXPRESSION') {
    return computation.expression;
  }

  return null;
};
