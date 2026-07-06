import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  BAITK_FOLDER_NAV_ID,
  TEAMS_NAV_ID,
  TEAMS_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export default defineNavigationMenuItem({
  universalIdentifier: TEAMS_NAV_ID,
  name: 'Teams',
  icon: 'IconUsersGroup',
  color: 'blue',
  position: 6,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: TEAMS_PAGE_LAYOUT_ID,
  folderUniversalIdentifier: BAITK_FOLDER_NAV_ID,
});
