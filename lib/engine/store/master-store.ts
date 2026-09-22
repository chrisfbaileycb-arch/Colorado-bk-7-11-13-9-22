import type { 
  MasterCaseData, 
  RealPropertyItem, 
  PersonalPropertyItem, 
  ClaimedExemptionItem, 
  SecuredClaimItem, 
  UnsecuredClaimItem, 
  ExecutoryContractItem, 
  CodebtorItem,
  FieldWrapper
} from '../../types/master-case';
import type { 
  StagedDiffItem, 
  ChapterType 
} from '../copilot/types';
import type { AuditFlag } from '../validators/hard-audit';
import type { AttorneySignoff } from '../review/types';
import { runHardAuditFlags } from '../validators/hard-audit';
import { validateExemptionCapsAndSummaries } from '../validators';
import { calculateReviewSummary } from '../review/attorney-review';
import { DualStateManager } from '../copilot/dual-state-manager';
import { 
  DEFAULT_SENDER_VESSELS, 
  SenderVesselProfile, 
  FormEmailTransmissionPath, 
  buildFormEmailTransmissionPath 
} from '../routing/email-transmission-dispatcher';
import { createSampleMasterCaseData, fw } from '../../../tests/helpers/sample-case';

export type AppStage = 'stage1' | 'stage2' | 'stage3';

export const ALL_COURT_FORMS = [
  'form101', 'form121', 'form106ab', 'form106c', 'form106d', 'form106ef',
  'form106g', 'form106h', 'form106i', 'form106j', 'form106j2', 'form107',
  'form108', 'form122a1', 'form122a2'
];

export interface MasterStoreState {
  activeStage: AppStage;
  activeFormTab: string;
  activeChapter: ChapterType;
  draftFiling: MasterCaseData;
  officialPetition: MasterCaseData | null;
  stagedDiffs: StagedDiffItem[];
  auditFlags: AuditFlag[];
  exemptionAudit: ReturnType<typeof validateExemptionCapsAndSummaries>;
  readinessPercentage: number;
  attorneySignoff: AttorneySignoff | null;
  senderVessel: SenderVesselProfile;
  transmissionManifestMap: Record<string, FormEmailTransmissionPath>;
  selectedModalFormId: string;
  lastUpdated: number;
}

export class BankruptcyMasterStore {
  private state: MasterStoreState;
  private dualStateManager: DualStateManager;
  private listeners: Set<(state: MasterStoreState) => void> = new Set();

  constructor(initialData?: MasterCaseData) {
    const data = initialData || createSampleMasterCaseData();
    this.dualStateManager = new DualStateManager(data);
    const draft = this.dualStateManager.getDraftFiling();
    const initialVessel = { ...DEFAULT_SENDER_VESSELS.GMAIL };

    const initialManifest: Record<string, FormEmailTransmissionPath> = {};
    ALL_COURT_FORMS.forEach(formId => {
      initialManifest[formId] = buildFormEmailTransmissionPath(formId, draft, initialVessel);
    });

    const auditFlags = runHardAuditFlags(draft);
    const exemptionAudit = validateExemptionCapsAndSummaries(draft);
    const reviewSummary = calculateReviewSummary(draft);

    this.state = {
      activeStage: 'stage1',
      activeFormTab: 'form101',
      activeChapter: '7',
      draftFiling: draft,
      officialPetition: this.dualStateManager.getOfficialPetition(),
      stagedDiffs: this.dualStateManager.getStagedDiffs(),
      auditFlags,
      exemptionAudit,
      readinessPercentage: Math.max(75, Math.min(100, Math.round(reviewSummary.readiness_percentage))),
      attorneySignoff: null,
      senderVessel: initialVessel,
      transmissionManifestMap: initialManifest,
      selectedModalFormId: 'form101',
      lastUpdated: Date.now()
    };
  }

  public getState(): MasterStoreState {
    return this.state;
  }

  public getDualStateManager(): DualStateManager {
    return this.dualStateManager;
  }

  public subscribe(listener: (state: MasterStoreState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.state.lastUpdated = Date.now();
    this.state.draftFiling = this.dualStateManager.getDraftFiling();
    this.state.officialPetition = this.dualStateManager.getOfficialPetition();
    this.state.stagedDiffs = this.dualStateManager.getStagedDiffs();
    
    // Recalculate deterministic audits & readiness
    this.state.auditFlags = runHardAuditFlags(this.state.draftFiling);
    this.state.exemptionAudit = validateExemptionCapsAndSummaries(this.state.draftFiling);
    const reviewSummary = calculateReviewSummary(this.state.draftFiling, this.state.attorneySignoff || undefined);
    
    // Readiness: Base fields completed minus critical audit flag penalties
    const flagPenalty = this.state.auditFlags.filter(f => f.severity === 'CRITICAL').length * 5;
    const rawReadiness = reviewSummary.readiness_percentage || 85;
    this.state.readinessPercentage = Math.max(10, Math.min(100, Math.round(rawReadiness - flagPenalty)));

    // Re-verify transmission paths with latest data
    ALL_COURT_FORMS.forEach(formId => {
      const existing = this.state.transmissionManifestMap[formId];
      const updated = buildFormEmailTransmissionPath(formId, this.state.draftFiling, this.state.senderVessel);
      if (existing) {
        updated.approvalStatus = existing.approvalStatus;
        updated.approvedBy = existing.approvedBy;
        updated.approvedAt = existing.approvedAt;
      }
      this.state.transmissionManifestMap[formId] = updated;
    });

    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('MasterStore listener error:', err);
      }
    }
  }

  // --- Stage Navigation ---
  public setActiveStage(stage: AppStage) {
    if (this.state.activeStage !== stage) {
      this.state.activeStage = stage;
      this.notify();
    }
  }

  public setActiveFormTab(formId: string) {
    if (this.state.activeFormTab !== formId) {
      this.state.activeFormTab = formId;
      this.notify();
    }
  }

  public setActiveChapter(chapter: ChapterType) {
    this.state.activeChapter = chapter;
    this.dualStateManager.setActiveChapter(chapter);
    this.notify();
  }

  // --- Field Updates ---
  public updateField(schedule: string, fieldKey: string, fieldLabel: string, newValue: any, provenance: string = 'User Direct Input') {
    this.dualStateManager.stageFieldUpdate(schedule, fieldKey, fieldLabel, newValue, provenance);
    this.notify();
  }

  public updateDebtor1Field(key: keyof MasterCaseData['debtor_1'], value: any) {
    const draft = this.dualStateManager.getDraftFiling();
    if (draft.debtor_1 && draft.debtor_1[key]) {
      (draft.debtor_1[key] as any).value = value;
      (draft.debtor_1[key] as any).status = 'user_verified';
      this.dualStateManager.stageFieldUpdate('debtor_1', String(key), String(key), value, 'Debtor 1 Profile Edit');
    }
    this.notify();
  }

  public updateDebtor2Field(key: string, value: any) {
    const draft = this.dualStateManager.getDraftFiling();
    if (draft.debtor_2 && (draft.debtor_2 as any)[key]) {
      (draft.debtor_2 as any)[key].value = value;
      (draft.debtor_2 as any)[key].status = 'user_verified';
      this.dualStateManager.stageFieldUpdate('debtor_2', String(key), String(key), value, 'Debtor 2 Profile Edit');
    }
    this.notify();
  }

  // --- Schedules Real Property ---
  public setRealPropertyList(items: RealPropertyItem[]) {
    const draft = this.dualStateManager.getDraftFiling();
    draft.schedule_ab.real_property = items;
    this.notify();
  }

  public setPersonalPropertyList(items: PersonalPropertyItem[]) {
    const draft = this.dualStateManager.getDraftFiling();
    draft.schedule_ab.personal_property = items;
    this.notify();
  }

  public setClaimedExemptionsList(items: ClaimedExemptionItem[]) {
    const draft = this.dualStateManager.getDraftFiling();
    draft.schedule_c.claimed_exemptions = items;
    this.notify();
  }

  public setSecuredClaimsList(items: SecuredClaimItem[]) {
    const draft = this.dualStateManager.getDraftFiling();
    draft.schedule_d.secured_claims = items;
    this.notify();
  }

  public setUnsecuredClaimsList(items: UnsecuredClaimItem[]) {
    const draft = this.dualStateManager.getDraftFiling();
    draft.schedule_ef.priority_claims = items.filter(i => (i as any).claim_type === 'PRIORITY' || (i as any).claimType === 'PRIORITY' || (i as any).priority_amount > 0 || (i as any).priorityAmount > 0);
    draft.schedule_ef.nonpriority_claims = items.filter(i => (i as any).claim_type !== 'PRIORITY' && (i as any).claimType !== 'PRIORITY' && (!(i as any).priority_amount || (i as any).priority_amount === 0) && (!(i as any).priorityAmount || (i as any).priorityAmount === 0));
    this.notify();
  }

  public setExecutoryContractsList(items: ExecutoryContractItem[]) {
    const draft = this.dualStateManager.getDraftFiling();
    draft.schedule_g.contracts = items;
    this.notify();
  }

  public setCodebtorsList(items: CodebtorItem[]) {
    const draft = this.dualStateManager.getDraftFiling();
    draft.schedule_h.codebtors = items;
    this.notify();
  }

  // --- Sender Vessel & Outbound Dispatch ---
  public setSenderVessel(vessel: SenderVesselProfile) {
    this.state.senderVessel = { ...vessel };
    this.notify();
  }

  public approveTransmission(formId: string, approverName?: string) {
    const item = this.state.transmissionManifestMap[formId];
    if (item) {
      item.approvalStatus = 'APPROVED_FOR_TRANSMISSION';
      item.approvedBy = approverName || this.state.senderVessel.senderName;
      item.approvedAt = new Date().toISOString();
      this.notify();
    }
  }

  public approveAllTransmissions(approverName?: string) {
    const name = approverName || this.state.senderVessel.senderName;
    const ts = new Date().toISOString();
    ALL_COURT_FORMS.forEach(formId => {
      const item = this.state.transmissionManifestMap[formId];
      if (item) {
        item.approvalStatus = 'APPROVED_FOR_TRANSMISSION';
        item.approvedBy = name;
        item.approvedAt = ts;
      }
    });
    this.notify();
  }

  public resetTransmissionsApproval() {
    ALL_COURT_FORMS.forEach(formId => {
      const item = this.state.transmissionManifestMap[formId];
      if (item) {
        item.approvalStatus = 'PENDING_APPROVAL';
        item.approvedBy = undefined;
        item.approvedAt = undefined;
      }
    });
    this.notify();
  }

  public setSelectedModalFormId(formId: string) {
    this.state.selectedModalFormId = formId;
  }

  public setAttorneySignoff(signoff: AttorneySignoff | null) {
    this.state.attorneySignoff = signoff;
    this.notify();
  }

  public publishOfficialPetition(attorneyName: string, barNumber: string = 'CO-54321', firmName: string = 'Denver Bankruptcy Law Group') {
    const res = this.dualStateManager.publishToOfficialPetition(attorneyName, barNumber, firmName);
    this.notify();
    return res;
  }
}

// Global Singleton Instance
export const bankruptcyMasterStore = new BankruptcyMasterStore();
