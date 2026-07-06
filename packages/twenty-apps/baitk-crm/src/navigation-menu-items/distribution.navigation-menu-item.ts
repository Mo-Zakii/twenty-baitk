import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  BAITK_FOLDER_NAV_ID,
  DISTRIBUTION_NAV_ID,
  DISTRIBUTION_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export default defineNavigationMenuItem({
  universalIdentifier: DISTRIBUTION_NAV_ID,
  name: 'Distribution',
  icon: 'IconRotate',
  color: 'blue',
  position: 2,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: DISTRIBUTION_PAGE_LAYOUT_ID,
  folderUniversalIdentifier: BAITK_FOLDER_NAV_ID,
});
