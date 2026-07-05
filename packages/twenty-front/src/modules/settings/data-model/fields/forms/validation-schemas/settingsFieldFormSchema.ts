import { settingsDataModelFieldDescriptionFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';
import { settingsDataModelFieldIconLabelFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';
import { settingsDataModelFieldSettingsFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { settingsDataModelFieldTypeFormSchema } from '~/pages/settings/data-model/new-field/SettingsObjectNewFieldSelect';

type SettingsFieldFormSchemaOptions = {
  existingOtherLabels?: string[];
  sourceObjectMetadataId?: string;
};

const fieldComputationFormSchema = z.object({
  computation: z
    .union([
      z.object({
        mode: z.literal('EXPRESSION'),
        expression: z.string().min(1),
      }),
      z.object({
        mode: z.literal('EXPRESSION_BY_SUB_FIELD'),
        expressionBySubField: z.record(z.string(), z.string().min(1)),
      }),
    ])
    .nullable()
    .optional(),
});

export const settingsFieldFormSchema = (
  options: SettingsFieldFormSchemaOptions = {},
) => {
  const { existingOtherLabels, sourceObjectMetadataId } = options;

  const baseSchema = z
    .object({})
    .extend(
      settingsDataModelFieldIconLabelFormSchema(existingOtherLabels).shape,
    )
    .extend(settingsDataModelFieldDescriptionFormSchema().shape)
    .extend(settingsDataModelFieldTypeFormSchema.shape)
    .extend(fieldComputationFormSchema.shape)
    .and(settingsDataModelFieldSettingsFormSchema)
    .refine((data) => {
      const formData = data as {
        type?: FieldMetadataType;
        morphRelationObjectMetadataIds?: string[];
      };
      if (formData.type !== FieldMetadataType.MORPH_RELATION) return true;
      if (!isDefined(sourceObjectMetadataId)) return true;
      if (
        !isDefined(formData.morphRelationObjectMetadataIds) ||
        formData.morphRelationObjectMetadataIds.length <= 1
      )
        return true;
      if (
        formData.morphRelationObjectMetadataIds.includes(sourceObjectMetadataId)
      )
        return false;
      return true;
    });

  return baseSchema;
};
