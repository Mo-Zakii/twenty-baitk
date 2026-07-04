import { FieldMetadataType } from 'twenty-shared/types';
import {
  CustomError,
  getExpectedFormulaValueTypeForComputedFieldType,
  inferFormulaReturnTypeOrThrow,
  isComputableFieldMetadataType,
  isDefined,
  mapFieldMetadataTypeToFormulaValueType,
  parseFormulaExpressionOrThrow,
  transpileFormulaToPostgresExpressionOrThrow,
  type FormulaValueType,
} from 'twenty-shared/utils';

import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import {
  buildFormulaFieldReferencesContext,
  type FormulaFieldReferencesContext,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/build-formula-field-references-context.util';
import { deriveComputedCurrencyCodeAsExpressionOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/derive-computed-currency-code-as-expression.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type ComputedAsExpressions = {
  asExpression?: string;
  asExpressionByCompositePropertyName?: Record<string, string>;
};

// Transpiles a field's computation into Postgres generated-column expressions:
// EXPRESSION fills the scalar column (for CURRENCY: amountMicros plus a derived
// currencyCode copy); EXPRESSION_BY_SUB_FIELD fills one sub-column per entry
export const deriveComputedAsExpressionsForFlatFieldMetadataOrThrow = ({
  computedFlatFieldMetadata,
  siblingFlatFieldMetadatas,
}: {
  computedFlatFieldMetadata: FlatFieldMetadata;
  siblingFlatFieldMetadatas: FlatFieldMetadata[];
}): ComputedAsExpressions => {
  const { computation } = computedFlatFieldMetadata;

  if (!isDefined(computation)) {
    throw new CustomError(
      `Field ${computedFlatFieldMetadata.name} has no computation`,
      'COMPUTED_EXPRESSION_MISSING',
    );
  }

  const referencesContext = buildFormulaFieldReferencesContext({
    siblingFlatFieldMetadatas,
  });

  if (computation.mode === 'EXPRESSION') {
    return deriveExpressionComputation({
      computedFlatFieldMetadata,
      expression: computation.expression,
      referencesContext,
      siblingFlatFieldMetadatas,
    });
  }

  return deriveExpressionBySubFieldComputation({
    computedFlatFieldMetadata,
    expressionBySubField: computation.expressionBySubField,
    referencesContext,
  });
};

const transpileExpressionOrThrow = ({
  expression,
  expectedReturnType,
  referencesContext,
  errorContext,
}: {
  expression: string;
  expectedReturnType: FormulaValueType;
  referencesContext: FormulaFieldReferencesContext;
  errorContext: string;
}): string => {
  const formulaAstNode = parseFormulaExpressionOrThrow(expression);

  const inferredReturnType = inferFormulaReturnTypeOrThrow({
    node: formulaAstNode,
    fieldReferenceTypes: referencesContext.fieldReferenceTypes,
  });

  if (
    inferredReturnType !== 'NULL' &&
    inferredReturnType !== expectedReturnType
  ) {
    throw new CustomError(
      `${errorContext} returns ${inferredReturnType} but expects ${expectedReturnType}`,
      'COMPUTED_EXPRESSION_TYPE_ERROR',
    );
  }

  return transpileFormulaToPostgresExpressionOrThrow({
    node: formulaAstNode,
    fieldReferenceTypes: referencesContext.fieldReferenceTypes,
    columnNameByFieldReferenceKey:
      referencesContext.columnNameByFieldReferenceKey,
  });
};

const deriveExpressionComputation = ({
  computedFlatFieldMetadata,
  expression,
  referencesContext,
  siblingFlatFieldMetadatas,
}: {
  computedFlatFieldMetadata: FlatFieldMetadata;
  expression: string;
  referencesContext: FormulaFieldReferencesContext;
  siblingFlatFieldMetadatas: FlatFieldMetadata[];
}): ComputedAsExpressions => {
  if (!isComputableFieldMetadataType(computedFlatFieldMetadata.type)) {
    throw new CustomError(
      `Field type ${computedFlatFieldMetadata.type} does not support expression computation`,
      'COMPUTED_EXPRESSION_UNSUPPORTED_TYPE',
    );
  }

  const transpiledExpression = transpileExpressionOrThrow({
    expression,
    expectedReturnType: getExpectedFormulaValueTypeForComputedFieldType(
      computedFlatFieldMetadata.type,
    ),
    referencesContext,
    errorContext: 'Expression',
  });

  if (computedFlatFieldMetadata.type === FieldMetadataType.CURRENCY) {
    return {
      asExpressionByCompositePropertyName: {
        amountMicros: transpiledExpression,
        currencyCode: deriveComputedCurrencyCodeAsExpressionOrThrow({
          computedExpression: expression,
          siblingFlatFieldMetadatas,
        }),
      },
    };
  }

  return { asExpression: transpiledExpression };
};

const deriveExpressionBySubFieldComputation = ({
  computedFlatFieldMetadata,
  expressionBySubField,
  referencesContext,
}: {
  computedFlatFieldMetadata: FlatFieldMetadata;
  expressionBySubField: Record<string, string>;
  referencesContext: FormulaFieldReferencesContext;
}): ComputedAsExpressions => {
  const compositeType = getCompositeTypeOrThrow(computedFlatFieldMetadata.type);
  const asExpressionByCompositePropertyName: Record<string, string> = {};

  for (const [subFieldName, expression] of Object.entries(
    expressionBySubField,
  )) {
    const compositeProperty = compositeType.properties.find(
      (property) => property.name === subFieldName,
    );

    if (!isDefined(compositeProperty)) {
      throw new CustomError(
        `Sub field ${subFieldName} does not exist on ${computedFlatFieldMetadata.type}`,
        'COMPUTED_EXPRESSION_UNSUPPORTED_TYPE',
      );
    }

    const expectedReturnType = mapFieldMetadataTypeToFormulaValueType(
      compositeProperty.type,
    );

    if (!isDefined(expectedReturnType)) {
      throw new CustomError(
        `Sub field ${subFieldName} of ${computedFlatFieldMetadata.type} is not a scalar and cannot be computed`,
        'COMPUTED_EXPRESSION_UNSUPPORTED_TYPE',
      );
    }

    asExpressionByCompositePropertyName[subFieldName] =
      transpileExpressionOrThrow({
        expression,
        expectedReturnType,
        referencesContext,
        errorContext: `Sub field ${subFieldName} expression`,
      });
  }

  return { asExpressionByCompositePropertyName };
};
