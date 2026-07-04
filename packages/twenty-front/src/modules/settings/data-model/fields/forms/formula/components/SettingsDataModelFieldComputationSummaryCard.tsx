import { styled } from '@linaria/react';
import { type FieldMetadataComputation } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledSubFieldName = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledExpression = styled.code`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

type SettingsDataModelFieldComputationSummaryCardProps = {
  computation: FieldMetadataComputation;
};

export const SettingsDataModelFieldComputationSummaryCard = ({
  computation,
}: SettingsDataModelFieldComputationSummaryCardProps) => {
  const expressionBySubField =
    computation.mode === 'EXPRESSION_BY_SUB_FIELD'
      ? computation.expressionBySubField
      : { expression: computation.expression };

  return (
    <StyledContainer>
      {Object.entries(expressionBySubField).map(
        ([subFieldName, expression]) => (
          <StyledRow key={subFieldName}>
            <StyledSubFieldName>{subFieldName}</StyledSubFieldName>
            <StyledExpression>{expression}</StyledExpression>
          </StyledRow>
        ),
      )}
    </StyledContainer>
  );
};
