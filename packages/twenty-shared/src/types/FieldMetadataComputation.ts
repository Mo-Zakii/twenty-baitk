// Computation mode of a field, orthogonal to its representation type: null
// means user-entered storage; EXPRESSION derives the column (for CURRENCY, its
// amountMicros) from same-record fields; EXPRESSION_BY_SUB_FIELD derives one
// composite sub-column per entry
export type FieldMetadataExpressionComputation = {
  mode: 'EXPRESSION';
  expression: string;
};

export type FieldMetadataExpressionBySubFieldComputation = {
  mode: 'EXPRESSION_BY_SUB_FIELD';
  expressionBySubField: Record<string, string>;
};

export type FieldMetadataComputation =
  | FieldMetadataExpressionComputation
  | FieldMetadataExpressionBySubFieldComputation;
