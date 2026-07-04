import { FieldMetadataType } from '@/types/FieldMetadataType';

export const COMPUTABLE_COMPOSITE_FIELD_METADATA_TYPES = [
  FieldMetadataType.CURRENCY,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.LINKS,
  FieldMetadataType.EMAILS,
  FieldMetadataType.PHONES,
] as const satisfies FieldMetadataType[];

export type ComputableCompositeFieldMetadataType =
  (typeof COMPUTABLE_COMPOSITE_FIELD_METADATA_TYPES)[number];
