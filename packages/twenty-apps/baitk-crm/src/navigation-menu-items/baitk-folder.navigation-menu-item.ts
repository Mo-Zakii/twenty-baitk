import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { BAITK_FOLDER_NAV_ID } from 'src/constants/uuids';

export { BAITK_FOLDER_NAV_ID };

export default defineNavigationMenuItem({
  universalIdentifier: BAITK_FOLDER_NAV_ID,
  name: 'BAITK CRM',
  icon: 'IconBuildingSkyscraper',
  color: 'blue',
  position: 0,
  type: NavigationMenuItemType.FOLDER,
});
