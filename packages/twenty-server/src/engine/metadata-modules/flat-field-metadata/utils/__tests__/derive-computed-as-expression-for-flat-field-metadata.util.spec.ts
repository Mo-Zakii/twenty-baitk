import { faker } from '@faker-js/faker';
import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { deriveComputedAsExpressionsForFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/derive-computed-as-expression-for-flat-field-metadata.util';

const objectMetadataId = faker.string.uuid();

const getSiblingFlatFieldMetadata = ({
  name,
  type,
}: {
  name: string;
  type: FieldMetadataType;
}): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    universalIdentifier: faker.string.uuid(),
    objectMetadataId,
    type,
    name,
  });

const getComputedFlatFieldMetadataWithExpression = ({
  expression,
  type,
}: {
  expression: string;
  type: FieldMetadataType;
}): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    universalIdentifier: faker.string.uuid(),
    objectMetadataId,
    type,
    name: 'computedField',
    computation: { mode: 'EXPRESSION', expression },
  });

const getComputedFlatFieldMetadataWithExpressionBySubField = ({
  expressionBySubField,
  type,
}: {
  expressionBySubField: Record<string, string>;
  type: FieldMetadataType;
}): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    universalIdentifier: faker.string.uuid(),
    objectMetadataId,
    type,
    name: 'computedField',
    computation: { mode: 'EXPRESSION_BY_SUB_FIELD', expressionBySubField },
  });

describe('deriveComputedAsExpressionsForFlatFieldMetadataOrThrow', () => {
  const siblingFlatFieldMetadatas = [
    getSiblingFlatFieldMetadata({
      name: 'amount',
      type: FieldMetadataType.NUMBER,
    }),
    getSiblingFlatFieldMetadata({ name: 'name', type: FieldMetadataType.TEXT }),
    getSiblingFlatFieldMetadata({
      name: 'annualRecurringRevenue',
      type: FieldMetadataType.CURRENCY,
    }),
  ];

  it('should transpile a NUMBER expression computation to a scalar asExpression', () => {
    expect(
      deriveComputedAsExpressionsForFlatFieldMetadataOrThrow({
        computedFlatFieldMetadata: getComputedFlatFieldMetadataWithExpression({
          expression: 'ROUND(amount * 0.88, 2)',
          type: FieldMetadataType.NUMBER,
        }),
        siblingFlatFieldMetadatas,
      }),
    ).toEqual({
      asExpression:
        'ROUND((("amount" * 0.88))::numeric, (2)::integer)::double precision',
    });
  });

  it('should map composite sub-field references to flattened column names', () => {
    expect(
      deriveComputedAsExpressionsForFlatFieldMetadataOrThrow({
        computedFlatFieldMetadata: getComputedFlatFieldMetadataWithExpression({
          expression: 'annualRecurringRevenue.amountMicros / 1000000',
          type: FieldMetadataType.NUMBER,
        }),
        siblingFlatFieldMetadatas,
      }),
    ).toEqual({
      asExpression:
        '("annualRecurringRevenueAmountMicros" / NULLIF(1000000, 0))',
    });
  });

  it('should derive amountMicros and currencyCode for a CURRENCY expression shorthand', () => {
    expect(
      deriveComputedAsExpressionsForFlatFieldMetadataOrThrow({
        computedFlatFieldMetadata: getComputedFlatFieldMetadataWithExpression({
          expression: 'annualRecurringRevenue.amountMicros * 2',
          type: FieldMetadataType.CURRENCY,
        }),
        siblingFlatFieldMetadatas,
      }),
    ).toEqual({
      asExpressionByCompositePropertyName: {
        amountMicros: '("annualRecurringRevenueAmountMicros" * 2)',
        currencyCode: '"annualRecurringRevenueCurrencyCode"',
      },
    });
  });

  it('should derive one asExpression per sub field for a FULL_NAME EXPRESSION_BY_SUB_FIELD computation', () => {
    expect(
      deriveComputedAsExpressionsForFlatFieldMetadataOrThrow({
        computedFlatFieldMetadata:
          getComputedFlatFieldMetadataWithExpressionBySubField({
            expressionBySubField: {
              firstName: 'name',
              lastName: 'name',
            },
            type: FieldMetadataType.FULL_NAME,
          }),
        siblingFlatFieldMetadatas,
      }),
    ).toEqual({
      asExpressionByCompositePropertyName: {
        firstName: '"name"',
        lastName: '"name"',
      },
    });
  });

  it('should reject an expression whose inferred type differs from the field type', () => {
    expect(() =>
      deriveComputedAsExpressionsForFlatFieldMetadataOrThrow({
        computedFlatFieldMetadata: getComputedFlatFieldMetadataWithExpression({
          expression: 'CONCAT(name, "!")',
          type: FieldMetadataType.NUMBER,
        }),
        siblingFlatFieldMetadatas,
      }),
    ).toThrow('Expression returns TEXT but expects NUMBER');
  });

  it('should reject an expression referencing another computed field', () => {
    const computedSibling = getComputedFlatFieldMetadataWithExpression({
      expression: 'amount * 2',
      type: FieldMetadataType.NUMBER,
    });

    expect(() =>
      deriveComputedAsExpressionsForFlatFieldMetadataOrThrow({
        computedFlatFieldMetadata: getComputedFlatFieldMetadataWithExpression({
          expression: 'computedField + 1',
          type: FieldMetadataType.NUMBER,
        }),
        siblingFlatFieldMetadatas: [
          ...siblingFlatFieldMetadatas,
          computedSibling,
        ],
      }),
    ).toThrow("Unknown field 'computedField'");
  });

  it('should reject an expression referencing a non-existent field', () => {
    expect(() =>
      deriveComputedAsExpressionsForFlatFieldMetadataOrThrow({
        computedFlatFieldMetadata: getComputedFlatFieldMetadataWithExpression({
          expression: 'unknownField * 2',
          type: FieldMetadataType.NUMBER,
        }),
        siblingFlatFieldMetadatas,
      }),
    ).toThrow("Unknown field 'unknownField'");
  });

  it('should reject an unknown sub field for an EXPRESSION_BY_SUB_FIELD computation', () => {
    expect(() =>
      deriveComputedAsExpressionsForFlatFieldMetadataOrThrow({
        computedFlatFieldMetadata:
          getComputedFlatFieldMetadataWithExpressionBySubField({
            expressionBySubField: { unknownSubField: 'name' },
            type: FieldMetadataType.FULL_NAME,
          }),
        siblingFlatFieldMetadatas,
      }),
    ).toThrow('does not exist on FULL_NAME');
  });
});
