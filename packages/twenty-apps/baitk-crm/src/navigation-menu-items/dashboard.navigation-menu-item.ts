import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  BAITK_FOLDER_NAV_ID,
  DASHBOARD_NAV_ID,
  DASHBOARD_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export default defineNavigationMenuItem({
  universalIdentifier: DASHBOARD_NAV_ID,
  name: 'Dashboard',
  icon: 'IconChartBar',
  color: 'blue',
  position: 1,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: DASHBOARD_PAGE_LAYOUT_ID,
  folderUniversalIdentifier: BAITK_FOLDER_NAV_ID,
});
