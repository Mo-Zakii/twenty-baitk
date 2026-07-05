import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  compositeTypeDefinitions,
  type FieldMetadataType,
} from 'twenty-shared/types';
import {
  isDefined,
  mapFieldMetadataTypeToFormulaValueType,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { SettingsDataModelFieldFormulaExpressionEditor } from '@/settings/data-model/fields/forms/formula/components/SettingsDataModelFieldFormulaExpressionEditor';
import { buildFormulaFieldReferenceTypes } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaFieldReferenceTypes';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledSubFieldName = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

type SettingsDataModelFieldComputationBySubFieldFormProps = {
  fieldType: FieldMetadataType;
  existingFieldMetadataId: string;
  objectNameSingular: string;
  disabled?: boolean;
};

export const SettingsDataModelFieldComputationBySubFieldForm = ({
  fieldType,
  existingFieldMetadataId,
  objectNameSingular,
  disabled,
}: SettingsDataModelFieldComputationBySubFieldFormProps) => {
  const { control } = useFormContext();

  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const fieldReferenceTypes = useMemo(
    () =>
      buildFormulaFieldReferenceTypes({
        fieldMetadataItems: objectMetadataItem.fields.filter(
          (siblingFieldMetadataItem) =>
            siblingFieldMetadataItem.id !== existingFieldMetadataId,
        ),
      }),
    [objectMetadataItem, existingFieldMetadataId],
  );

  const computableCompositeProperties = (
    compositeTypeDefinitions.get(fieldType)?.properties ?? []
  ).filter((compositeProperty) =>
    isDefined(mapFieldMetadataTypeToFormulaValueType(compositeProperty.type)),
  );

  return (
    <Controller
      name="computation"
      control={control}
      defaultValue={fieldMetadataItem?.computation ?? null}
      render={({ field: { onChange, value } }) => {
        const expressionBySubField: Record<string, string> =
          value?.mode === 'EXPRESSION_BY_SUB_FIELD'
            ? value.expressionBySubField
            : {};

        const handleSubFieldExpressionChange = (
          subFieldName: string,
          expression: string,
        ) => {
          const nextExpressionBySubField = { ...expressionBySubField };

          if (expression.trim().length > 0) {
            nextExpressionBySubField[subFieldName] = expression;
          } else {
            delete nextExpressionBySubField[subFieldName];
          }

          onChange(
            Object.keys(nextExpressionBySubField).length > 0
              ? {
                  mode: 'EXPRESSION_BY_SUB_FIELD',
                  expressionBySubField: nextExpressionBySubField,
                }
              : null,
          );
        };

        return (
          <StyledContainer>
            {computableCompositeProperties.map((compositeProperty) => {
              const expectedFormulaValueType =
                mapFieldMetadataTypeToFormulaValueType(compositeProperty.type);

              if (!isDefined(expectedFormulaValueType)) {
                return null;
              }

              return (
                <div key={compositeProperty.name}>
                  <StyledSubFieldName>
                    {compositeProperty.name}
                  </StyledSubFieldName>
                  <SettingsDataModelFieldFormulaExpressionEditor
                    expression={
                      expressionBySubField[compositeProperty.name] ?? ''
                    }
                    expectedFormulaValueType={expectedFormulaValueType}
                    fieldReferenceTypes={fieldReferenceTypes}
                    onChange={(expression) =>
                      handleSubFieldExpressionChange(
                        compositeProperty.name,
                        expression,
                      )
                    }
                    disabled={disabled}
                  />
                </div>
              );
            })}
          </StyledContainer>
        );
      }}
    />
  );
};
