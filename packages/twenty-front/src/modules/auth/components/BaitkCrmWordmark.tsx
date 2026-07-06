import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { BAITK_CRM_WORDMARK_SVG_PATH } from '~/constants/baitk-crm-branding.constants';

const StyledWordmark = styled.div`
  background-color: ${themeCssVariables.font.color.primary};
  height: 36px;
  mask-image: url('${BAITK_CRM_WORDMARK_SVG_PATH}');
  mask-mode: alpha;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  width: min(320px, 90vw);
  -webkit-mask-image: url('${BAITK_CRM_WORDMARK_SVG_PATH}');
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
`;

type BaitkCrmWordmarkProps = {
  className?: string;
};

export const BaitkCrmWordmark = ({ className }: BaitkCrmWordmarkProps) => (
  <StyledWordmark
    aria-label="BAITK CRM"
    className={className}
    role="img"
  />
);
