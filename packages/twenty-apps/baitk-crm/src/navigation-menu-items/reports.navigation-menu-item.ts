import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  BAITK_FOLDER_NAV_ID,
  REPORTS_NAV_ID,
  REPORTS_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export { REPORTS_NAV_ID };

export default defineNavigationMenuItem({
  universalIdentifier: REPORTS_NAV_ID,
  name: 'Reports',
  icon: 'IconChartBar',
  color: 'blue',
  position: 4,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: REPORTS_PAGE_LAYOUT_ID,
  folderUniversalIdentifier: BAITK_FOLDER_NAV_ID,
});
