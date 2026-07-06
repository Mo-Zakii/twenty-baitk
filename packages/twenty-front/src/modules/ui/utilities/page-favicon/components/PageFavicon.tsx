import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { Helmet } from 'react-helmet-async';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getImageAbsoluteURI } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  BAITK_CRM_FAVICON_DARK_16_PATH,
  BAITK_CRM_FAVICON_DARK_32_PATH,
  BAITK_CRM_FAVICON_DARK_SVG_PATH,
  BAITK_CRM_FAVICON_LIGHT_16_PATH,
  BAITK_CRM_FAVICON_LIGHT_32_PATH,
  BAITK_CRM_FAVICON_LIGHT_SVG_PATH,
  BAITK_CRM_FAVICON_SVG_PATH,
} from '~/constants/baitk-crm-branding.constants';

export const PageFavicon = () => {
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);

  const workspaceLogoUrl = workspacePublicData?.logo
    ? getImageAbsoluteURI({
        imageUrl: workspacePublicData.logo,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      })
    : null;

  if (workspaceLogoUrl) {
    return (
      <Helmet>
        <link rel="icon" type="image/png" href={workspaceLogoUrl} />
      </Helmet>
    );
  }

  return (
    <Helmet>
      <link
        rel="icon"
        type="image/svg+xml"
        href={BAITK_CRM_FAVICON_SVG_PATH}
      />
      <link
        rel="icon"
        type="image/svg+xml"
        href={BAITK_CRM_FAVICON_LIGHT_SVG_PATH}
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="icon"
        type="image/svg+xml"
        href={BAITK_CRM_FAVICON_DARK_SVG_PATH}
        media="(prefers-color-scheme: dark)"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={BAITK_CRM_FAVICON_LIGHT_32_PATH}
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={BAITK_CRM_FAVICON_LIGHT_16_PATH}
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={BAITK_CRM_FAVICON_DARK_32_PATH}
        media="(prefers-color-scheme: dark)"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={BAITK_CRM_FAVICON_DARK_16_PATH}
        media="(prefers-color-scheme: dark)"
      />
    </Helmet>
  );
};
