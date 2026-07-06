import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  BAITK_FOLDER_NAV_ID,
  LEADS_NAV_ID,
} from 'src/constants/uuids';
import { LEADS_VIEW_ID } from 'src/views/all-leads.view';

export default defineNavigationMenuItem({
  universalIdentifier: LEADS_NAV_ID,
  name: 'Leads',
  icon: 'IconUserSearch',
  color: 'blue',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: LEADS_VIEW_ID,
  folderUniversalIdentifier: BAITK_FOLDER_NAV_ID,
});
