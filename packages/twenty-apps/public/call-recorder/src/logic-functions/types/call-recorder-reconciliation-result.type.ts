import { type CallRecorderReconciliationAction } from 'src/logic-functions/constants/call-recorder-reconciliation-action';

type Actions = typeof CallRecorderReconciliationAction;

export type CallRecorderReconciliationResult =
  | {
      action: Actions['CREATED'] | Actions['UPDATED'] | Actions['CANCELED'];
      realMeetingKey: string;
      callRecordingId: string;
    }
  | {
      action: Actions['SKIPPED'];
      realMeetingKey: string;
      callRecordingId: string | null;
    }
  | {
      action: Actions['FAILED'];
      realMeetingKey: string;
      errorMessage: string;
    };
