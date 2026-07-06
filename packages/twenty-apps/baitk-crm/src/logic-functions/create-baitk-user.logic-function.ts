import { defineLogicFunction } from 'twenty-sdk/define';
import { CREATE_BAITK_USER_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import { parseEventBody, provisionBaitkUser } from 'src/utils/baitk-user-provision.util';

type LogicFunctionEvent = {
  body?: unknown;
};

const handler = async (event: LogicFunctionEvent) => {
  const body = parseEventBody(event.body);

  try {
    const result = await provisionBaitkUser({
      email: body.email ?? '',
      password: body.password ?? '',
      firstName: body.firstName ?? '',
      lastName: body.lastName ?? '',
      roleId: body.roleId ?? '',
    });

    return {
      success: true,
      message: `User ${result.email} created. They can sign in with the email and password you set.`,
      workspaceMemberId: result.workspaceMemberId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create user';

    return {
      success: false,
      message,
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: CREATE_BAITK_USER_LOGIC_FUNCTION_ID,
  name: 'baitk-create-user',
  description:
    'Creates a workspace user with email and password (no invitation email)',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/baitk/users/create',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
