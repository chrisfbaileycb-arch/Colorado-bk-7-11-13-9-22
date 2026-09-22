import type { MasterCaseData, FieldWrapper } from '../../types/master-case';
import type { StagedDiffItem, ChapterType } from './types';
import { runHardAuditFlags, type AuditFlag } from '../validators/hard-audit';
import { createSampleMasterCaseData } from '../../../tests/helpers/sample-case';

export class DualStateManager {
  private draftFiling: MasterCaseData;
  private officialPetition: MasterCaseData | null = null;
  private stagedDiffs: StagedDiffItem[] = [];
  private activeChapter: ChapterType = '7';
  private publishedAt: string | null = null;
  private publishedByAttorney: string | null = null;

  constructor(initialData?: MasterCaseData) {
    this.draftFiling = initialData ? JSON.parse(JSON.stringify(initialData)) : createSampleMasterCaseData();
    // Initially mirror draft as baseline official copy
    this.officialPetition = JSON.parse(JSON.stringify(this.draftFiling));
  }

  public getActiveChapter(): ChapterType {
    return this.activeChapter;
  }

  public setActiveChapter(chapter: ChapterType) {
    this.activeChapter = chapter;
    this.draftFiling.chapter = chapter;
    if (this.officialPetition) {
      this.officialPetition.chapter = chapter;
    }
  }

  public getDraftFiling(): MasterCaseData {
    return this.draftFiling;
  }

  public getOfficialPetition(): MasterCaseData | null {
    return this.officialPetition;
  }

  public getStagedDiffs(): StagedDiffItem[] {
    return [...this.stagedDiffs];
  }

  public getPendingDiffCount(): number {
    return this.stagedDiffs.filter(d => d.status === 'STAGED').length;
  }

  public isPublished(): boolean {
    return this.publishedAt !== null && this.stagedDiffs.filter(d => d.status === 'STAGED').length === 0;
  }

  public getPublicationMetadata() {
    return {
      publishedAt: this.publishedAt,
      publishedByAttorney: this.publishedByAttorney,
      isSynced: this.getPendingDiffCount() === 0
    };
  }

  /**
   * Stage a specific field update in the Draft Filing working copy
   */
  public stageFieldUpdate(
    schedule: string,
    fieldKey: string,
    fieldLabel: string,
    newValue: any,
    provenanceSource: string = 'Copilot Guided Intake'
  ): StagedDiffItem {
    const oldValue = this.getDraftFieldValue(schedule, fieldKey);
    
    // Check if an existing staged diff exists for this field
    const existingIdx = this.stagedDiffs.findIndex(
      d => d.schedule === schedule && d.fieldKey === fieldKey && d.status === 'STAGED'
    );

    const diffItem: StagedDiffItem = {
      id: `diff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      schedule,
      fieldKey,
      fieldLabel,
      oldValue,
      newValue,
      provenanceSource,
      status: 'STAGED',
      timestamp: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      this.stagedDiffs[existingIdx] = diffItem;
    } else {
      this.stagedDiffs.push(diffItem);
    }

    // Apply the change immediately to the Draft working copy
    this.applyFieldToDraft(schedule, fieldKey, newValue, provenanceSource);

    return diffItem;
  }

  /**
   * Batch stage multiple fields for a schedule
   */
  public stageScheduleBatch(
    schedule: string,
    fields: Record<string, any>,
    provenanceSource: string = 'Copilot Batch Action'
  ): StagedDiffItem[] {
    const results: StagedDiffItem[] = [];
    for (const [key, val] of Object.entries(fields)) {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const item = this.stageFieldUpdate(schedule, key, label, val, provenanceSource);
      results.push(item);
    }
    return results;
  }

  /**
   * Revert a staged diff item
   */
  public revertStagedDiff(diffId: string): boolean {
    const item = this.stagedDiffs.find(d => d.id === diffId);
    if (!item) return false;

    // Restore old value to draft
    this.applyFieldToDraft(item.schedule, item.fieldKey, item.oldValue, 'Revert to previous value');
    item.status = 'REJECTED';
    return true;
  }

  /**
   * Discard all uncommitted staged diffs and reset draft back to official
   */
  public resetDraftToOfficial() {
    if (this.officialPetition) {
      this.draftFiling = JSON.parse(JSON.stringify(this.officialPetition));
      this.stagedDiffs = [];
    }
  }

  /**
   * Publish Draft Filing into the Official Live Petition
   * Requires 0 Critical Hard Audit Blockers.
   */
  public publishToOfficialPetition(
    attorneyName: string,
    barNumber: string,
    lawFirm: string
  ): { success: boolean; auditFlags: AuditFlag[]; message: string } {
    const auditFlags = runHardAuditFlags(this.draftFiling);
    const criticalFlags = auditFlags.filter(f => f.severity === 'CRITICAL');

    if (criticalFlags.length > 0) {
      return {
        success: false,
        auditFlags,
        message: `Publication blocked: ${criticalFlags.length} Critical Hard Audit Flag(s) must be resolved first.`
      };
    }

    // Commit draft to official petition
    this.officialPetition = JSON.parse(JSON.stringify(this.draftFiling));
    this.publishedAt = new Date().toISOString();
    this.publishedByAttorney = `${attorneyName} (Bar #${barNumber}, ${lawFirm})`;

    // Mark all staged diffs as ACCEPTED
    for (const diff of this.stagedDiffs) {
      if (diff.status === 'STAGED') {
        diff.status = 'ACCEPTED';
      }
    }

    return {
      success: true,
      auditFlags,
      message: `Official Petition successfully published and signed by ${this.publishedByAttorney}.`
    };
  }

  private getDraftFieldValue(schedule: string, fieldKey: string): any {
    const d = this.draftFiling as any;
    if (schedule === '101/121' || schedule === 'Debtor1') {
      return d.debtor_1?.[fieldKey]?.value;
    }
    if (schedule === 'Debtor2') {
      return d.debtor_2?.[fieldKey]?.value;
    }
    if (schedule === '106I' || schedule === 'ScheduleI') {
      return d.schedule_i?.[fieldKey]?.value;
    }
    if (schedule === '106J' || schedule === 'ScheduleJ') {
      return d.schedule_j?.[fieldKey]?.value;
    }
    if (schedule === '122A/C' || schedule === 'MeansTest') {
      return d.means_test_122a?.[fieldKey]?.value;
    }
    return undefined;
  }

  private applyFieldToDraft(schedule: string, fieldKey: string, value: any, source: string) {
    const d = this.draftFiling as any;
    const wrap = (v: any, fId: string): FieldWrapper<any> => ({
      field_id: fId,
      value: v,
      source: { type: 'manual_entry', calculated_by: source },
      status: 'user_verified',
      mapped_destinations: [schedule]
    });

    if (schedule === '101/121' || schedule === 'Debtor1') {
      if (!d.debtor_1) d.debtor_1 = {};
      d.debtor_1[fieldKey] = wrap(value, `d1.${fieldKey}`);
    } else if (schedule === 'Debtor2') {
      if (!d.debtor_2) d.debtor_2 = {};
      d.debtor_2[fieldKey] = wrap(value, `d2.${fieldKey}`);
    } else if (schedule === '106I' || schedule === 'ScheduleI') {
      if (!d.schedule_i) d.schedule_i = {};
      d.schedule_i[fieldKey] = wrap(value, `i.${fieldKey}`);
    } else if (schedule === '106J' || schedule === 'ScheduleJ') {
      if (!d.schedule_j) d.schedule_j = {};
      d.schedule_j[fieldKey] = wrap(value, `j.${fieldKey}`);
    } else if (schedule === '122A/C' || schedule === 'MeansTest') {
      if (!d.means_test_122a) d.means_test_122a = {};
      d.means_test_122a[fieldKey] = wrap(value, `mt.${fieldKey}`);
    }
  }
}
