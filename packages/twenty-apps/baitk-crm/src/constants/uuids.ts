// BAITK CRM — stable UUID v4 identifiers (RFC 4122 compliant)

export const APPLICATION_ID = '868edcc2-7d45-4123-9358-1a3cd7ea1742';

export const ROLE_IDS = {
  owner: '9749446e-5f8f-4ca9-ab05-c32832c24604',
  operations: '2c28ba8b-1661-4270-8c88-48d5b6dae7cb',
  marketing: 'b51331db-cc99-4647-ab07-792486fac724',
  manager: '63061e76-9c66-4bcb-bb5d-36f26510e5df',
  teamLeader: 'dca07dd6-17aa-43d0-afef-87a43ffb942e',
  sales: '2459c68d-c05a-4ad0-be3b-846d34d9339f',
  function: 'c931cddc-9c67-4441-922f-26ab49505def',
} as const;

export const LEAD_OBJECT_ID = 'aab73be7-d7f7-43d4-86b3-44a8127a223a';
export const TEAM_OBJECT_ID = '063bfbdb-bc26-43a2-a2df-7a68e38072ee';
export const LEAD_ACTIVITY_OBJECT_ID = '6802b17d-9f5b-4f42-ada5-c6c91805f0fa';
export const LEAD_COMMENT_OBJECT_ID = 'b53175d6-45e3-4846-9e68-38556c69bbbe';
export const BAITK_NOTIFICATION_OBJECT_ID =
  '5f71a443-8d7e-42a8-b670-952064784963';
export const INTEGRATION_OBJECT_ID = '5902c9bb-627d-468b-b1e5-ecdbe622f4ab';
export const DISTRIBUTION_QUEUE_OBJECT_ID =
  '326ed307-5ac8-4d6b-af2e-d23d3748f1ac';
export const CUSTOM_REPORT_OBJECT_ID = '017dd91b-ecf3-4dfb-a563-3e59d399639e';

export const LEAD_FIELD_IDS = {
  name: '0d9ac0d3-367a-407e-bd4c-d9f5ff839c05',
  phone: 'a7b8d023-feb1-4642-a249-b9b64dfa6c26',
  email: '8274a3d7-6305-4893-883e-94fec0e9193e',
  source: 'c8b946c8-8a3b-4d8b-a2f7-301e48036dd6',
  budget: '63e25efd-1e2d-4dcb-b382-f3ac259a37fb',
  compound: 'f5b6e2ef-5151-4851-aa0b-c67c959550f0',
  stage: '49cceb12-a06b-4ca4-b394-dbd636c4d771',
  assignee: '760b2360-86d9-4832-9292-4247172bca68',
  team: 'ee0e5658-3de6-4e88-a7b3-5b8f32aa9e0e',
  teamLeaderScope: '3d2418e1-f993-44aa-9d39-a6f38efeee95',
  teamManagerScope: 'b40c7771-da2e-4055-946f-d37b54c67506',
} as const;

export const LEAD_STAGE_OPTION_IDS = {
  fresh: 'c1bb98dc-a4b9-42ff-9445-c780d1f02600',
  noAnswer: '989dbd3f-388d-4e82-a893-2dee9c2ccdf0',
  callBack: '00466a9b-9af2-42af-ad0c-c69975b35c10',
  potential: '4014ad0a-5b81-45d3-a274-43469196f4b9',
  meeting: '9331a257-12a7-4118-8c23-28ca1494ef13',
  won: '4e5585b2-2414-4b68-b27a-94b3c9976968',
  lost: '9ae4a64e-9dfe-45a2-be0f-d5444f6db99c',
} as const;

export const TEAM_FIELD_IDS = {
  name: '89b11e77-7965-4066-8051-7b4567cb0ce1',
  manager: '79774852-ee90-4ce2-9cd5-07cc8c6482a9',
  leader: '444dbc06-2031-4ff0-ac25-b145fae55dd8',
} as const;

export const LEAD_ACTIVITY_FIELD_IDS = {
  lead: 'c0d1c7f3-2b29-41cd-a9cf-6fa526d669b1',
  fromStage: 'fe296e75-3020-4bb1-920e-f2df1f10625f',
  toStage: '376afee1-4d93-4d09-bbf1-eb3a02a6d84c',
  note: 'c84cb0a0-13b7-4088-b972-ab124f67f652',
} as const;

export const LEAD_COMMENT_FIELD_IDS = {
  lead: '1f8cb0a3-ca44-4581-ae39-6bf083319f1f',
  text: 'd8943317-07cb-4e1c-8806-1e58f883b730',
} as const;

export const BAITK_NOTIFICATION_FIELD_IDS = {
  message: '1c2bddd1-60ae-4e43-8b31-41f2e456f429',
  notificationType: 'fa379564-2ab2-46de-8025-f763ea07728c',
  isRead: '20d2b509-b57e-4cc9-a5ce-c381bdd6e49a',
  lead: '9344ae48-34ad-472a-8fd8-fbfdeb52b151',
  recipient: '525448f9-dc35-4d1d-8500-add3578cc288',
} as const;

export const BAITK_NOTIFICATION_TYPE_OPTION_IDS = {
  won: '208632b4-cb49-49ea-9e9e-38118d93257c',
  lost: '59ddb00b-ac7b-44de-8c12-bdb3c2f5bf52',
  stageChange: '8c646af2-42f8-4a02-ab91-e8696d257d2c',
  newUnassigned: '9d8e33ff-075b-4193-9ad9-f7f4630d97c5',
  reassigned: '243d0604-36e8-493b-ae17-4d1daf52c890',
} as const;

export const INTEGRATION_FIELD_IDS = {
  name: '75a6b84e-8840-4b9e-8faa-bb5291437bdb',
  integrationType: 'ed395afb-851c-46b5-91a7-b657ddeee7ea',
  sheetId: '64d6cb13-4476-43a4-85c0-fa1de7220bba',
  isActive: 'dea587df-043d-4230-afab-707738416eab',
  webhookSecret: 'e9f0a1b2-c3d4-4567-9e5f-7a8b9c0d1e2f',
  columnMapping: 'f0a1b2c3-d4e5-4678-8f6a-8b9c0d1e2f3a',
  customSourceLabel: 'a1b2c3d4-e5f6-4789-a7b8-c9d0e1f2a3b4',
  googleConnectionId: 'e3c72fde-9c38-46d3-9d4c-8e0fd5f27515',
  sheetTabName: '02e1fe83-e2d6-4b29-8bb7-41caff5da2e4',
  lastProcessedRow: '31a54c9a-2afa-41d2-8a72-f1f868ad33b4',
  lastSyncAt: '581d3f6b-d157-4ca2-b0ce-d9d7ba474416',
  lastSyncError: 'e8a059aa-4b3f-47e0-aedb-d30b950f0b64',
} as const;

export const INTEGRATION_TYPE_OPTION_IDS = {
  googleSheets: 'a0b1c2d3-e4f5-4a6b-8c8d-9e0f1a2b3c4e',
  webhook: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
  zapier: 'a4b5c6d7-e8f9-4234-8a1b-2c3d4e4f5a6b',
  metaLeads: 'f3a4b5c6-d7e8-4123-9f0a-1b2c3d4e5f6a',
  customForm: 'b5c6d7e8-f9a0-4345-9b2c-3d4e5f6a7b9c',
} as const;

export const DISTRIBUTION_QUEUE_FIELD_IDS = {
  name: 'f1a2b3c4-d5e6-4a7b-8c9d-0e1f2a3b4c5d',
  assignee: '5af48ed3-a290-40f5-8948-375c08e15859',
  queueOrder: 'd845099f-dc29-4909-80b0-31d9051aab97',
  lastAssignedAt: '553f2be9-db2b-4e54-825e-af3a7d53c520',
} as const;

export const QUEUE_ON_MEMBER_FIELD_ID =
  'e4f5a6b7-c8d9-4e0f-8a2b-3c4d5e6f7a8c';

export const CUSTOM_REPORT_FIELD_IDS = {
  name: '42a21a88-a479-46e5-ab4b-c88dd8e935c9',
  config: 'bf2bb194-0b72-4257-8218-6890a6ee5760',
} as const;

export const ACTIVITIES_ON_LEAD_FIELD_ID =
  '54dd5ef5-ca3f-46e9-91fb-da24cd05e71d';
export const COMMENTS_ON_LEAD_FIELD_ID =
  '8d852c26-635f-4e56-908a-3f123a5dd0a4';
export const LEADS_ON_TEAM_FIELD_ID = 'a1553b3d-7252-4275-8e22-1a27562d4338';
export const NOTIFICATIONS_ON_LEAD_FIELD_ID =
  '1a00ab82-6c1a-44ac-8715-abdda64326d6';
export const NOTIFICATIONS_ON_MEMBER_FIELD_ID =
  '0faa562f-6344-450a-893d-b3fe0fe52b70';
export const SCOPED_LEADS_ON_MEMBER_FIELD_ID =
  '38c4c791-f14d-497b-82b8-f84d57f3b658';
export const MANAGER_SCOPED_LEADS_ON_MEMBER_FIELD_ID =
  'b7e5cd4c-06b9-4d5b-acbe-e0d0c1b42bcc';
export const MANAGED_TEAMS_ON_MEMBER_FIELD_ID =
  'c7e5114d-ae01-42f6-8a94-a9fa370ba1de';
export const LED_TEAMS_ON_MEMBER_FIELD_ID =
  'e34e5aa0-d695-4704-93c8-62a84e5a0f57';
export const ASSIGNED_LEADS_ON_MEMBER_FIELD_ID =
  '9032e276-a3d4-4b47-aa20-cdbc6e55d7c4';

export const LEADS_VIEW_ID = 'd6a352f2-4074-452f-920a-c4171c69ed9d';
export const UNASSIGNED_LEADS_VIEW_ID = '491be71f-17c8-485e-bcf6-4c405f4c2b62';
export const LEADS_PIPELINE_VIEW_ID = '0964d7cf-3d95-4539-9d5a-763cfb965e90';
export const ACTIVITIES_VIEW_ID = '6198c02a-f0b3-4b3a-8321-b653b0d9c1f8';
export const TEAMS_VIEW_ID = 'ae4173ef-7dcc-4d37-8b91-f3e155e2ad5c';
export const CUSTOM_REPORTS_VIEW_ID =
  '36c620d7-bada-44f0-a3bd-6a987d856a7b';

export const BAITK_FOLDER_NAV_ID = '0dd6aa0c-6c73-4a4d-90f5-5ee7d3bcd15a';
export const LEADS_NAV_ID = '24939bbb-db3b-4aa3-a3d4-197c4652a7f8';
export const DASHBOARD_NAV_ID = '5198a55d-a004-4489-916f-4881495d85fa';
export const DISTRIBUTION_NAV_ID = 'b1f0acdc-9375-4214-b2ff-f8a428587967';
export const REPORTS_NAV_ID = 'c752b8a7-d390-4faa-905e-9e2431a604a4';
export const CUSTOM_REPORTS_NAV_ID =
  'a8b9c0d1-e2f3-4a5b-9c0d-1e2f3a4b5c6d';
export const ACTIVITY_NAV_ID = 'ba127efa-253e-4876-9189-693919ee77f2';
export const TEAMS_NAV_ID = 'a9c818d9-b647-41f8-a3f6-1ce32396d8ec';
export const INTEGRATIONS_NAV_ID = 'c0d9e8f7-a6b5-4345-a0b9-e8f7a6b59432';
export const USERS_NAV_ID = 'b6c7d8e9-f0a1-4345-8b3c-4d5e6f7a8b9c';

export const DASHBOARD_PAGE_LAYOUT_ID = '458cd8be-32a4-4f5c-9375-047fabf7d942';
export const DISTRIBUTION_PAGE_LAYOUT_ID =
  'd2883240-5291-4669-a964-76bb321896a0';
export const LEAD_RECORD_PAGE_LAYOUT_ID = 'ff940069-ba7a-4e6d-a16e-72533d4721c5';
export const REPORTS_PAGE_LAYOUT_ID = '4a2710b3-0d27-44e2-933e-a4b9a3637067';
export const INTEGRATIONS_PAGE_LAYOUT_ID =
  'b9e8d7c6-b5a4-4234-9e8d-7c6b5a493021';
export const USERS_PAGE_LAYOUT_ID = 'a5b6c7d8-e9f0-4234-9a2b-3c4d5e6f7a8b';

export const DISTRIBUTION_FRONT_COMPONENT_ID =
  'fc6bf35e-ff2e-4ffd-8907-26708e20d436';
export const NOTIFICATIONS_FRONT_COMPONENT_ID =
  '525a6d12-a463-4c98-bffb-7551f4482ec2';
export const REPORTS_FRONT_COMPONENT_ID =
  '234ea073-cee6-4c2f-9e61-cc04a3a47c2a';
export const INTEGRATIONS_FRONT_COMPONENT_ID =
  'a8f7e6d5-c4b3-4123-8f7e-6d5c4b3a2f1e';
export const USERS_FRONT_COMPONENT_ID =
  'f4a5b6c7-d8e9-4123-8f1a-2b3c4d5e6f7a';
export const TEAMS_FRONT_COMPONENT_ID =
  'b7c8d9e0-f1a2-4356-b789-0abcdef12345';

export const TEAMS_PAGE_LAYOUT_ID = 'd17c465e-82c3-4d0a-aa10-a456a4258740';
export const TEAMS_PAGE_IDS = {
  tab: '194dba42-1ed8-44a4-9c5c-f99f0865ab78',
  widget: 'ebbf836c-db0d-40e5-bb4e-600d02ed9f2f',
} as const;

export const WEBHOOK_LOGIC_FUNCTION_ID = 'e6034cf0-0941-41b8-ace0-1405de4f8d73';
export const STAGE_CHANGED_LOGIC_FUNCTION_ID =
  '75673e55-8cf9-493a-a89c-0fe05da89b63';
export const AUTO_DISTRIBUTE_LOGIC_FUNCTION_ID =
  '5067c5c4-0433-4101-956f-ed90b3f46415';
export const POST_INSTALL_LOGIC_FUNCTION_ID =
  'b2b72d8e-8c9d-4a88-b269-014077f26533';
export const SYNC_LEAD_SCOPE_LOGIC_FUNCTION_ID =
  '11886918-1ec1-4506-8c7b-6228edb245ad';
export const SYNC_LEAD_SCOPE_ON_CREATE_LOGIC_FUNCTION_ID =
  'f1a2b3c4-d5e6-4789-a012-3456789abc01';
export const SYNC_LEADS_ON_TEAM_UPDATE_LOGIC_FUNCTION_ID =
  'a2b3c4d5-e6f7-4890-b123-456789abcd02';
export const SYNC_DISTRIBUTION_QUEUE_LOGIC_FUNCTION_ID =
  '7a8ea743-6cd9-4f7b-9777-e15550963ce7';
export const CREATE_BAITK_USER_LOGIC_FUNCTION_ID =
  'e1f2a3b4-c5d6-4789-a012-3456789abcde';
export const CHANGE_BAITK_PASSWORD_LOGIC_FUNCTION_ID =
  'f2a3b4c5-d6e7-4890-b123-456789abcdef';
export const SET_BAITK_USER_PASSWORD_LOGIC_FUNCTION_ID =
  'a3b4c5d6-e7f8-4901-8234-56789abcdef0';

export const GOOGLE_CONNECTION_PROVIDER_ID =
  'fa4ab843-a06f-475b-a661-9c4ffb088c88';
export const LIST_GOOGLE_SPREADSHEETS_ROUTE_ID =
  '7c59fd67-7ccb-4c36-9dbb-9e345e8e8606';
export const LIST_GOOGLE_SHEET_TABS_ROUTE_ID =
  'e74deae8-be19-48f2-b3b4-260579ad3178';
export const PREVIEW_GOOGLE_SHEET_ROUTE_ID =
  'e9925d5f-1b3c-4fd0-935d-d4164af109f6';
export const SYNC_GOOGLE_SHEET_NOW_ROUTE_ID =
  'd30b266f-aceb-4931-b317-22eb0aeb7d1a';
export const POLL_GOOGLE_SHEETS_LOGIC_FUNCTION_ID =
  '75ebc5c6-476b-4e22-baf9-3704ba936ec8';

export const WORKSPACE_MEMBER_OBJECT_ID =
  '20202020-3319-4234-a34c-82d5c0e881a6';

export const ALL_LEADS_VIEW_FIELD_IDS = {
  name: '1d14c25d-78fb-42c8-8343-901b3a022c93',
  phone: 'e4cf86b3-88e0-4189-9aa0-aa9be14a5ff4',
  source: 'd2eec061-1b0f-490f-9067-592e8786289e',
  stage: 'b1dccb09-c78e-4125-8e3e-c73e9c78001c',
  assignee: '47aac4f2-872c-4ebf-872b-5dbc46efb96d',
  compound: '3a9f41e8-21cc-4ffe-a166-365b2a3e8c70',
} as const;

export const UNASSIGNED_LEADS_VIEW_FIELD_IDS = {
  filter: '9a2905cb-458e-4e5c-95bd-798611b6eddd',
  name: 'ed1a63a7-3874-4e44-96e7-bc216dd81e8f',
  phone: '8774e611-ca2a-4668-aa88-2dfc486ff87b',
  source: '535b8564-3a5d-4c6a-8e83-b3f0c8a476cf',
  stage: '56eb2bb4-c045-407b-9600-ac0db1bac3f5',
  compound: '58b06af4-0afa-4f35-9aa5-46561f90209d',
} as const;

export const PIPELINE_VIEW_FIELD_IDS = {
  name: '2d81e300-8974-4a65-b19d-8b80b535ddee',
  phone: '30491fa8-e426-4809-acca-5ed047ef5ff3',
  assignee: '238eadc4-284b-4864-9977-9ad9e625ea5c',
} as const;

export const PIPELINE_GROUP_IDS = {
  fresh: '6c4b706b-202e-463b-8a96-d6a05be34245',
  noAnswer: 'dd9b6645-77b8-4fdd-9dbf-e3cb419c4fa0',
  callBack: 'c8783815-f7d7-40dc-8c8c-c478023d3e2f',
  potential: 'e4a1c082-4d66-4480-b385-3e0e220ef329',
  meeting: '991bafb6-e1a3-4e1f-af0b-5761b59f689f',
  won: '7712f941-f603-4d55-8ce5-8557c43d2925',
  lost: '542c87cf-a4da-48b6-8261-2f740c47cf27',
} as const;

export const DASHBOARD_WIDGET_IDS = {
  tab: 'a92f7f42-6fc3-4e4c-a56e-515a41b2e7f5',
  totalLeads: '7dd74eed-3be0-4bcc-9886-07daec034984',
  wonLeads: '868edcc2-7d45-4123-9358-1a3cd7ea1743',
  lostLeads: '9749446e-5f8f-4ca9-ab05-c32832c24605',
  pipelineChart: '2c28ba8b-1661-4270-8c88-48d5b6dae7cc',
  sourceChart: 'b51331db-cc99-4647-ab07-792486fac725',
  notifications: '63061e76-9c66-4bcb-bb5d-36f26510e5e0',
} as const;

export const LEAD_RECORD_PAGE_IDS = {
  infoTab: 'dca07dd6-17aa-43d0-afef-87a43ffb942f',
  infoWidget: '2459c68d-c05a-4ad0-be3b-846d34d933a0',
  commentsTab: 'c931cddc-9c67-4441-922f-26ab49505df0',
  commentsWidget: 'aab73be7-d7f7-43d4-86b3-44a8127a223b',
  activityTab: '063bfbdb-bc26-43a2-a2df-7a68e38072ef',
  activityWidget: '6802b17d-9f5b-4f42-ada5-c6c91805f0f1',
} as const;

export const REPORTS_PAGE_IDS = {
  tab: 'b53175d6-45e3-4846-9e68-38556c69bbbf',
  widget: '5f71a443-8d7e-42a8-b670-952064784964',
} as const;

export const DISTRIBUTION_PAGE_IDS = {
  tab: '5902c9bb-627d-468b-b1e5-ecdbe622f4ac',
  widget: '326ed307-5ac8-4d6b-af2e-d23d3748f1ad',
} as const;

export const INTEGRATIONS_PAGE_IDS = {
  tab: 'd1e0f9a8-b7c6-4456-b1c0-f9a8b7c60543',
  widget: 'e2f1a0b9-c8d7-4567-82d1-a0b9c8d71654',
} as const;

export const USERS_PAGE_IDS = {
  tab: 'c7d8e9f0-a1b2-4456-9c4d-5e6f7a8b9c0d',
  widget: 'd8e9f0a1-b2c3-4567-8d4e-6f7a8b9c0d1e',
} as const;

export const ACTIVITY_VIEW_FIELD_IDS = {
  fromStage: '017dd91b-ecf3-4dfb-a563-3e59d399639f',
  toStage: 'f8e9d0c1-b2a3-4c5d-8e7f-6a5b4c3d2e1f',
  note: 'a7b8d023-feb1-4642-a249-b9b64dfa6c27',
} as const;

export const TEAMS_VIEW_FIELD_IDS = {
  name: '8274a3d7-6305-4893-883e-94fec0e9193f',
  leader: '017dd91b-ecf3-4dfb-a563-3e59d399639a',
  manager: 'f8e9d0c1-b2a3-4c5d-8e7f-6a5b4c3d2e1a',
} as const;

export const CUSTOM_REPORTS_VIEW_FIELD_IDS = {
  name: 'c4d5e6f7-a8b9-4012-9c0d-1e2f3a4b5c6e',
} as const;
