import type { MasterCaseData, DocumentType } from '../../types/master-case';

export type ChapterType = '7' | '11' | '13';

export type CopilotActionType = 
  | 'STAGE_DRAFT_UPDATE' 
  | 'AUDIT_WARNING' 
  | 'SWITCH_VIEW' 
  | 'READY_TO_PUBLISH'
  | 'RUN_HARD_AUDIT';

export interface AuditActionFlag {
  severity: 'INFO' | 'WARNING' | 'BLOCKER';
  message: string;
  statuteRef?: string;
  fieldKey?: string;
}

export interface StructuredCopilotAction {
  action: CopilotActionType;
  targetSchedule?: '106A/B' | '106C' | '106D' | '106E/F' | '106G' | '106H' | '106I' | '106J' | '122A/C' | '107' | '108' | '101/121';
  chapter?: 7 | 11 | 13;
  stagedFields?: Record<string, any>;
  auditFlags?: AuditActionFlag[];
  explanation?: string;
  stepNumber?: number;
}

export interface CopilotMessage {
  id: string;
  role: 'assistant' | 'user' | 'system';
  timestamp: string;
  content: string;
  suggestedActions?: Array<{ label: string; actionPrompt: string }>;
  structuredAction?: StructuredCopilotAction;
  stepRef?: number;
  highlightedRule?: string;
}

export interface StagedDiffItem {
  id: string;
  schedule: string;
  fieldKey: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
  provenanceSource: string;
  status: 'STAGED' | 'ACCEPTED' | 'REJECTED';
  timestamp: string;
}

export interface Chapter13PlanCalculation {
  chapter: 13;
  householdSize: number;
  annualizedCmi: number;
  medianThreshold: number;
  isAboveMedian: boolean;
  applicableCommitmentPeriodMonths: 36 | 60;
  monthlyGrossIncome: number;
  allowedMonthlyDeductions: number;
  disposableMonthlyIncomeDMI: number;
  totalPlanCommitmentAmount: number;
  priorityDebtTotal: number;
  securedDebtArrearsTotal: number;
  unsecuredGeneralDebtTotal: number;
  estimatedTrusteeFeePercentage: number;
  monthlyPlanPayment: number;
  estimatedUnsecuredDividendPercentage: number;
  liquidationFloorRequired: number;
  feasibilityVerdict: 'FEASIBLE' | 'BORDERLINE' | 'DEFICIT_REQUIRES_ADJUSTMENT';
}

export interface Chapter11SubchapterVEligibility {
  chapter: 11;
  subchapterV: boolean;
  totalDebtNoncontingentLiquidated: number;
  debtLimitCap: number; // Statutory $3,024,725 cap (or $7.5M aggregate)
  isUnderDebtLimit: boolean;
  businessDebtPercentage: number;
  isCommercialBusinessQualified: boolean; // >= 50% business debts
  overallEligible: boolean;
  notes: string[];
}

export interface Chapter7MeansTestAnalysis {
  chapter: 7;
  householdSize: number;
  cmi6MonthMonthlyAverage: number;
  annualizedCmi: number;
  coloradoMedianThreshold: number;
  isAboveMedian: boolean;
  totalAllowedIrsDeductions: number;
  monthlyDisposableIncome: number;
  disposableIncome60MonthTotal: number;
  presumptionOfAbuse: 'NO_PRESUMPTION' | 'PRESUMPTION_ARISES' | 'BORDERLINE_NEEDS_FURTHER_DEDUCTIONS';
  statuteCitation: string;
}
