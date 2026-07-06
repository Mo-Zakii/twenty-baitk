import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  BAITK_FOLDER_NAV_ID,
  USERS_NAV_ID,
  USERS_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export default defineNavigationMenuItem({
  universalIdentifier: USERS_NAV_ID,
  name: 'Users',
  icon: 'IconUserCog',
  color: 'blue',
  position: 7,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: USERS_PAGE_LAYOUT_ID,
  folderUniversalIdentifier: BAITK_FOLDER_NAV_ID,
});
