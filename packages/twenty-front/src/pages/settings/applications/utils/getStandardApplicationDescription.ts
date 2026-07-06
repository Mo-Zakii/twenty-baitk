import { t } from '@lingui/core/macro';

export const getStandardApplicationDescription =
  (): string => t`The base data model every BAITK CRM workspace runs on.

#### What "foundation" means

Every BAITK CRM workspace starts with this set of objects. They define the shape of your CRM, including relationships, activity, and reporting. Everything else, including marketplace apps, AI agents, and custom objects, plugs into them.

#### Included objects
- **People & Companies**: contact and account records
- **Opportunities**: your sales pipeline
- **Notes & Tasks**: activity and follow-ups
- **Workflows & Dashboards**: automation and reporting

Remove this app and the rest of BAITK CRM has nothing to hang off.

#### Build your own app

Extend BAITK CRM with your own objects, fields, logic functions, or AI skills.`;
