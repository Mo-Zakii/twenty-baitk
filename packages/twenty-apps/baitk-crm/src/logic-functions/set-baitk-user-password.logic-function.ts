import { defineLogicFunction } from 'twenty-sdk/define';
import { SET_BAITK_USER_PASSWORD_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import {
  parseEventBody,
  setBaitkUserPassword,
} from 'src/utils/baitk-user-provision.util';

type LogicFunctionEvent = {
  body?: unknown;
};

const handler = async (event: LogicFunctionEvent) => {
  const body = parseEventBody(event.body);
  const workspaceMemberId = body.workspaceMemberId ?? '';
  const newPassword = body.newPassword ?? '';

  if (!workspaceMemberId || !newPassword) {
    return {
      success: false,
      message: 'Member and new password are required',
    };
  }

  try {
    await setBaitkUserPassword({ workspaceMemberId, newPassword });

    return {
      success: true,
      message: 'Password updated',
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to set password';

    return {
      success: false,
      message,
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: SET_BAITK_USER_PASSWORD_LOGIC_FUNCTION_ID,
  name: 'baitk-set-user-password',
  description: 'Admin sets a new password for a workspace member',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/baitk/users/set-password',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
