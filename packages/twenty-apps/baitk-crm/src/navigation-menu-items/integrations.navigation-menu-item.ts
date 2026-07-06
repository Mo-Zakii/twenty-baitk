import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  BAITK_FOLDER_NAV_ID,
  INTEGRATIONS_NAV_ID,
  INTEGRATIONS_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export default defineNavigationMenuItem({
  universalIdentifier: INTEGRATIONS_NAV_ID,
  name: 'Integrations',
  icon: 'IconPlug',
  color: 'blue',
  position: 3,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: INTEGRATIONS_PAGE_LAYOUT_ID,
  folderUniversalIdentifier: BAITK_FOLDER_NAV_ID,
});
