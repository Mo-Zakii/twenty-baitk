import { useCallback } from 'react';

import {
  type HeadlessCommandContextApi,
  type HeadlessEngineCommandContextApi,
} from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

type WorkflowVersionRecord = Pick<
  WorkflowVersion,
  'id' | 'workflowId' | 'trigger' | '__typename'
>;

type EnrichParams = {
  headlessEngineCommandContextApi: HeadlessEngineCommandContextApi;
  workflowVersionId: string;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
};

export const useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation =
  () => {
    const { objectMetadataItems } = useObjectMetadataItems();

    const hasWorkflowVersionObject = objectMetadataItems.some(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular ===
        CoreObjectNameSingular.WorkflowVersion,
    );

    const fallbackObjectNameSingular =
      objectMetadataItems[0]?.nameSingular ??
      CoreObjectNameSingular.WorkspaceMember;

    const { findOneRecord: findOneWorkflowVersion } =
      useLazyFindOneRecord<WorkflowVersionRecord>({
        objectNameSingular: hasWorkflowVersionObject
          ? CoreObjectNameSingular.WorkflowVersion
          : fallbackObjectNameSingular,
        recordGqlFields: hasWorkflowVersionObject
          ? { id: true, workflowId: true, trigger: true }
          : { id: true },
      });

    const fetchWorkflowVersion = useCallback(
      async (versionId: string): Promise<WorkflowVersionRecord | undefined> => {
        if (!hasWorkflowVersionObject) {
          return undefined;
        }

        let record: WorkflowVersionRecord | undefined;

        await findOneWorkflowVersion({
          objectRecordId: versionId,
          onCompleted: (data) => {
            record = data;
          },
        });

        return record;
      },
      [findOneWorkflowVersion, hasWorkflowVersionObject],
    );

    const enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation =
      useCallback(
        async ({
          headlessEngineCommandContextApi,
          workflowVersionId,
          availabilityType,
          availabilityObjectMetadataId,
        }: EnrichParams): Promise<HeadlessCommandContextApi | undefined> => {
          const workflowVersion = await fetchWorkflowVersion(workflowVersionId);

          if (!isDefined(workflowVersion)) {
            return undefined;
          }

          return {
            ...headlessEngineCommandContextApi,
            workflowId: workflowVersion.workflowId,
            workflowVersionId: workflowVersion.id,
            trigger: workflowVersion.trigger,
            availabilityType,
            availabilityObjectMetadataId,
          };
        },
        [fetchWorkflowVersion],
      );

    return {
      enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation,
    };
  };
