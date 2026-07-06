import { defineLogicFunction } from 'twenty-sdk/define';
import { CHANGE_BAITK_PASSWORD_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import {
  changeBaitkPassword,
  parseEventBody,
} from 'src/utils/baitk-user-provision.util';

type LogicFunctionEvent = {
  body?: unknown;
};

const handler = async (event: LogicFunctionEvent) => {
  const body = parseEventBody(event.body);
  const currentPassword = body.currentPassword ?? '';
  const newPassword = body.newPassword ?? '';

  if (!currentPassword || !newPassword) {
    return {
      success: false,
      message: 'Current and new password are required',
    };
  }

  try {
    await changeBaitkPassword({ currentPassword, newPassword });

    return {
      success: true,
      message: 'Password updated',
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to change password';

    return {
      success: false,
      message,
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: CHANGE_BAITK_PASSWORD_LOGIC_FUNCTION_ID,
  name: 'baitk-change-password',
  description: 'Changes the signed-in user password without email',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/baitk/users/change-password',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
