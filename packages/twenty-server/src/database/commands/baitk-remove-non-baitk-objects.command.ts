import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const BAITK_OBJECT_NAMES = new Set([
  'lead',
  'baitkTeam',
  'leadActivity',
  'leadComment',
  'baitkNotification',
  'baitkIntegration',
  'distributionQueueEntry',
  'baitkCustomReport',
]);

// Workflow parent is removed for BAITK; drop orphaned workflow system objects too.
const FORCE_REMOVE_OBJECT_NAMES = new Set([
  'workflowAutomatedTrigger',
  'workflowRun',
  'workflowVersion',
]);

const MAX_DELETION_PASSES = 20;

const TWENTY_WORKFLOWS_NAV_UNIVERSAL_IDENTIFIER =
  '20202020-b007-4b07-8b07-c0aba11c0007';

const shouldRemoveObject = (flatObjectMetadata: FlatObjectMetadata): boolean => {
  if (BAITK_OBJECT_NAMES.has(flatObjectMetadata.nameSingular)) {
    return false;
  }

  if (FORCE_REMOVE_OBJECT_NAMES.has(flatObjectMetadata.nameSingular)) {
    return true;
  }

  if (flatObjectMetadata.isSystem) {
    return false;
  }

  return true;
};

@Command({
  name: 'workspace:baitk-remove-non-baitk-objects',
  description:
    'Permanently delete default Twenty CRM and demo objects, keeping BAITK CRM objects only',
})
export class BaitkRemoveNonBaitkObjectsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly applicationService: ApplicationService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  private async cleanupOrphanedBaitkMetadata(
    workspaceId: string,
    isDryRun: boolean,
  ): Promise<void> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      if (isDryRun) {
        const workflowCommands = await queryRunner.query(
          `SELECT id, label FROM core."commandMenuItem"
           WHERE "workspaceId" = $1
             AND ("workflowVersionId" IS NOT NULL
               OR "engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION')`,
          [workspaceId],
        );

        for (const command of workflowCommands) {
          this.logger.log(
            `[DRY RUN] Would delete workflow command ${command.label} (${command.id})`,
          );
        }

        this.logger.log(
          `[DRY RUN] Would delete Workflows navigation item (${TWENTY_WORKFLOWS_NAV_UNIVERSAL_IDENTIFIER})`,
        );

        return;
      }

      const deletedWorkflowCommandsResult = await queryRunner.query(
        `DELETE FROM core."commandMenuItem"
         WHERE "workspaceId" = $1
           AND ("workflowVersionId" IS NOT NULL
             OR "engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION')
         RETURNING id, label`,
        [workspaceId],
      );

      const deletedWorkflowCommands = Array.isArray(
        deletedWorkflowCommandsResult?.[0],
      )
        ? deletedWorkflowCommandsResult[0]
        : deletedWorkflowCommandsResult;

      for (const command of deletedWorkflowCommands) {
        this.logger.log(
          `Deleted workflow command ${command.label} (${command.id})`,
        );
      }

      const deletedNavigationItemsResult = await queryRunner.query(
        `DELETE FROM core."navigationMenuItem"
         WHERE "workspaceId" = $1
           AND "universalIdentifier" = $2
         RETURNING id, name`,
        [workspaceId, TWENTY_WORKFLOWS_NAV_UNIVERSAL_IDENTIFIER],
      );

      const deletedNavigationItems = Array.isArray(
        deletedNavigationItemsResult?.[0],
      )
        ? deletedNavigationItemsResult[0]
        : deletedNavigationItemsResult;

      for (const navigationItem of deletedNavigationItems) {
        this.logger.log(
          `Deleted navigation item ${navigationItem.name} (${navigationItem.id})`,
        );
      }

      const deletedOrphanAvailabilityCommandsResult = await queryRunner.query(
        `DELETE FROM core."commandMenuItem" commandMenuItem
         WHERE commandMenuItem."workspaceId" = $1
           AND commandMenuItem."availabilityObjectMetadataId" IS NOT NULL
           AND NOT EXISTS (
             SELECT 1
             FROM core."objectMetadata" objectMetadata
             WHERE objectMetadata.id = commandMenuItem."availabilityObjectMetadataId"
           )
         RETURNING commandMenuItem.id AS id, commandMenuItem.label AS label`,
        [workspaceId],
      );

      const deletedOrphanAvailabilityCommands = Array.isArray(
        deletedOrphanAvailabilityCommandsResult?.[0],
      )
        ? deletedOrphanAvailabilityCommandsResult[0]
        : deletedOrphanAvailabilityCommandsResult;

      for (const command of deletedOrphanAvailabilityCommands) {
        this.logger.log(
          `Deleted command with missing object metadata ${command.label} (${command.id})`,
        );
      }

      const deletedDemoCommandsResult = await queryRunner.query(
        `DELETE FROM core."commandMenuItem"
         WHERE "workspaceId" = $1
           AND label IN ('Hello World', 'Show Notification', 'Quick Lead')
         RETURNING id, label`,
        [workspaceId],
      );

      const deletedDemoCommands = Array.isArray(deletedDemoCommandsResult?.[0])
        ? deletedDemoCommandsResult[0]
        : deletedDemoCommandsResult;

      for (const command of deletedDemoCommands) {
        this.logger.log(
          `Deleted demo command ${command.label} (${command.id})`,
        );
      }

      await this.workspaceCacheService.flush(workspaceId, []);
    } finally {
      await queryRunner.release();
    }
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Removing non-BAITK objects for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const removedObjectNames: string[] = [];

    for (let pass = 1; pass <= MAX_DELETION_PASSES; pass++) {
      const { flatObjectMetadataMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
        ]);

      const objectsToDelete = Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      ).filter(isDefined).filter(shouldRemoveObject);

      if (objectsToDelete.length === 0) {
        break;
      }

      let deletedInPass = 0;

      for (const flatObjectMetadata of objectsToDelete) {
        if (isDryRun) {
          this.logger.log(
            `[DRY RUN] Would delete ${flatObjectMetadata.nameSingular} (${flatObjectMetadata.id})`,
          );
          continue;
        }

        try {
          await this.objectMetadataService.deleteOneObject({
            deleteObjectInput: { id: flatObjectMetadata.id },
            workspaceId,
            isSystemBuild: true,
            ownerFlatApplication: twentyStandardFlatApplication,
          });

          removedObjectNames.push(flatObjectMetadata.nameSingular);
          deletedInPass += 1;

          this.logger.log(
            `Deleted ${flatObjectMetadata.nameSingular} for workspace ${workspaceId}`,
          );
        } catch (error) {
          this.logger.warn(
            `Pass ${pass}: could not delete ${flatObjectMetadata.nameSingular} yet (${error instanceof Error ? error.message : String(error)})`,
          );
        }
      }

      if (isDryRun) {
        break;
      }

      if (deletedInPass === 0) {
        const remainingNames = objectsToDelete.map(
          (objectMetadata) => objectMetadata.nameSingular,
        );

        throw new Error(
          `Could not delete remaining objects after ${pass} pass(es): ${remainingNames.join(', ')}`,
        );
      }
    }

    const { flatObjectMetadataMaps: finalMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const remainingToRemove = Object.values(
      finalMaps.byUniversalIdentifier,
    ).filter(isDefined).filter(shouldRemoveObject);

    if (remainingToRemove.length > 0) {
      throw new Error(
        `Some non-BAITK objects remain: ${remainingToRemove.map((objectMetadata) => objectMetadata.nameSingular).join(', ')}`,
      );
    }

    this.logger.log(
      `Removed ${removedObjectNames.length} object(s): ${[...new Set(removedObjectNames)].join(', ') || 'none'}`,
    );

    await this.cleanupOrphanedBaitkMetadata(workspaceId, isDryRun);
  }
}
