import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  BAITK_FOLDER_NAV_ID,
  CUSTOM_REPORTS_NAV_ID,
} from 'src/constants/uuids';
import { CUSTOM_REPORTS_VIEW_ID } from 'src/views/all-custom-reports.view';

export { CUSTOM_REPORTS_NAV_ID };

export default defineNavigationMenuItem({
  universalIdentifier: CUSTOM_REPORTS_NAV_ID,
  name: 'Custom Reports',
  icon: 'IconChartDots',
  color: 'blue',
  position: 5,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: CUSTOM_REPORTS_VIEW_ID,
  folderUniversalIdentifier: BAITK_FOLDER_NAV_ID,
});
