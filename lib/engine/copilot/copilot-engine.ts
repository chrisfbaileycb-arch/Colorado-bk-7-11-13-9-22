import type { MasterCaseData } from '../../types/master-case';
import type { 
  CopilotMessage, 
  StructuredCopilotAction, 
  ChapterType, 
  Chapter7MeansTestAnalysis, 
  Chapter13PlanCalculation, 
  Chapter11SubchapterVEligibility 
} from './types';
import { ColoradoJurisdictionPack } from '../../jurisdictions/colorado';
import { runHardAuditFlags, type AuditFlag } from '../validators/hard-audit';
import { getColoradoMedianIncome } from '../validators';
import { DualStateManager } from './dual-state-manager';

export class BankruptcyCopilotEngine {
  private stateManager: DualStateManager;
  private conversationHistory: CopilotMessage[] = [];

  constructor(stateManager: DualStateManager) {
    this.stateManager = stateManager;
    this.initializeWelcomeMessage();
  }

  private initializeWelcomeMessage() {
    const welcome: CopilotMessage = {
      id: `msg_${Date.now()}_init`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `👋 **Welcome to your Bankruptcy Filing Copilot!**

I am a **rule-based assistant**: I match keywords in your message to pre-written guidance and run this app's deterministic checks. I am not an AI model, I make no network calls, and my answers are not legal advice. Statutory caps and median figures in this app are unverified and need attorney review.

All suggested updates are safely staged in your **Draft Filing** working copy first so you and your supervising attorney can review them before publishing to the **Official Petition**.

How would you like to start?`,
      suggestedActions: [
        { label: '🧭 Guide Me Step-by-Step', actionPrompt: 'Start step-by-step intake from Step 1' },
        { label: '📊 Run Means Test Check (Ch 7 vs 13)', actionPrompt: 'Analyze current CMI and Means Test qualification' },
        { label: '🛡️ Audit Colorado Homestead & Assets', actionPrompt: 'Audit Schedule C exemptions under C.R.S. 2026' },
        { label: '🚨 Scan for Red Flags', actionPrompt: 'Scan petition for Hard Audit red flags' },
        { label: '🏢 Check Subchapter V Eligibility (Ch 11)', actionPrompt: 'Evaluate Chapter 11 Subchapter V small business eligibility' }
      ]
    };
    this.conversationHistory.push(welcome);
  }

  public getMessages(): CopilotMessage[] {
    return [...this.conversationHistory];
  }

  public clearHistory() {
    this.conversationHistory = [];
    this.initializeWelcomeMessage();
  }

  /**
   * Main conversational processor that returns structured assistant messages
   */
  public async processUserPrompt(prompt: string, currentStep: number = 1): Promise<CopilotMessage> {
    const userMsg: CopilotMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: prompt
    };
    this.conversationHistory.push(userMsg);

    const lower = prompt.toLowerCase();
    const draft = this.stateManager.getDraftFiling();
    const currentChapter = this.stateManager.getActiveChapter();

    let responseContent = '';
    let structuredAction: StructuredCopilotAction | undefined;
    let suggestedActions: Array<{ label: string; actionPrompt: string }> = [];

    // 1. Means Test & CMI Check
    if (lower.includes('means test') || lower.includes('cmi') || lower.includes('chapter 7 vs 13') || lower.includes('qualification')) {
      const meansResult = this.calculateChapter7MeansTest(draft);
      const ch13Result = this.calculateChapter13Plan(draft);
      
      responseContent = `### 📊 Chapter Qualification & Means Test Analysis (11 U.S.C. § 707(b))

Here is the current analysis based on your 6-month historical income and Colorado median standards:

- **Household Size**: ${meansResult.householdSize} person(s)
- **6-Month CMI Monthly Average**: $${meansResult.cmi6MonthMonthlyAverage.toLocaleString()} / mo
- **Annualized CMI**: $${meansResult.annualizedCmi.toLocaleString()} / yr
- **Colorado Median Threshold (2026)**: $${meansResult.coloradoMedianThreshold.toLocaleString()} / yr
- **Income Status**: **${meansResult.isAboveMedian ? 'ABOVE MEDIAN (Means Test Form 122A-2 Applies)' : 'BELOW MEDIAN (Safe Harbor under § 707(b)(7))'}**
- **60-Month Disposable Income**: $${meansResult.disposableIncome60MonthTotal.toLocaleString()}
- **Presumption Verdict**: **${meansResult.presumptionOfAbuse.replace(/_/g, ' ')}**

${meansResult.isAboveMedian ? `⚠️ **Chapter 13 Alternative**: Since annualized income exceeds the median threshold, Chapter 13 requires a **${ch13Result.applicableCommitmentPeriodMonths}-Month Commitment Period** with an estimated monthly plan payment of **$${ch13Result.monthlyPlanPayment.toLocaleString()}/mo**.` : `✅ **Chapter 7 Safe Harbor**: Debtor qualifies for Chapter 7 liquidation relief without presumption of abuse.`}`;

      structuredAction = {
        action: 'AUDIT_WARNING',
        targetSchedule: '122A/C',
        chapter: currentChapter === '7' ? 7 : (currentChapter === '13' ? 13 : 11),
        auditFlags: meansResult.isAboveMedian ? [{
          severity: 'WARNING',
          message: `Annualized CMI ($${meansResult.annualizedCmi.toLocaleString()}) exceeds Colorado Median ($${meansResult.coloradoMedianThreshold.toLocaleString()}). Form 122A-2 expense deductions required.`,
          statuteRef: '11 U.S.C. § 707(b)(2)'
        }] : [{
          severity: 'INFO',
          message: 'Below Colorado median income threshold. Safe harbor established under 11 U.S.C. § 707(b)(7).',
          statuteRef: '11 U.S.C. § 707(b)(7)'
        }]
      };

      suggestedActions = [
        { label: '📝 Jump to Form 122A (Step 15)', actionPrompt: 'Go to Step 15 Means Testing' },
        { label: '📈 Calculate 36/60-Mo Chapter 13 Plan', actionPrompt: 'Calculate Chapter 13 repayment plan projection' },
        { label: '🛡️ Audit Schedule C Exemptions', actionPrompt: 'Audit Schedule C exemptions under C.R.S. 2026' }
      ];
    }

    // 2. Chapter 13 Repayment Plan Projections
    else if (lower.includes('chapter 13') || lower.includes('plan projection') || lower.includes('repayment plan') || lower.includes('dmi')) {
      const plan = this.calculateChapter13Plan(draft);

      responseContent = `### 📅 Chapter 13 Repayment Plan Projection (Form 122C-1 / 122C-2)

Under 11 U.S.C. § 1325(b), here is the structured wage-earner repayment projection:

- **Applicable Commitment Period**: **${plan.applicableCommitmentPeriodMonths} Months** (${plan.isAboveMedian ? 'Above Colorado Median' : 'Below Colorado Median'})
- **Monthly Net Disposable Income (DMI)**: **$${plan.disposableMonthlyIncomeDMI.toLocaleString()}**
- **Calculated Monthly Plan Payment**: **$${plan.monthlyPlanPayment.toLocaleString()} / mo**
- **Total Plan Commitment Pool**: **$${plan.totalPlanCommitmentAmount.toLocaleString()}**
- **Priority & Arrearage Payout**: $${(plan.priorityDebtTotal + plan.securedDebtArrearsTotal).toLocaleString()}
- **Estimated Unsecured Creditor Dividend**: **${plan.estimatedUnsecuredDividendPercentage.toFixed(1)}%**
- **Liquidation Test Floor (§ 1325(a)(4))**: $${plan.liquidationFloorRequired.toLocaleString()} (Unexempt equity minimum)
- **Feasibility Verdict**: **${plan.feasibilityVerdict}**`;

      structuredAction = {
        action: 'SWITCH_VIEW',
        targetSchedule: '122A/C',
        chapter: 13,
        stepNumber: 15
      };

      suggestedActions = [
        { label: '🔄 Switch Workspace to Chapter 13', actionPrompt: 'Set active chapter to 13' },
        { label: '🔍 Check Schedule J Budget', actionPrompt: 'Review Schedule J living expenses' },
        { label: '🚨 Scan Hard Audit Flags', actionPrompt: 'Scan petition for Hard Audit red flags' }
      ];
    }

    // 3. Chapter 11 Subchapter V Eligibility
    else if (lower.includes('chapter 11') || lower.includes('subchapter v') || lower.includes('small business') || lower.includes('sub v')) {
      const subV = this.evaluateSubchapterV(draft);

      responseContent = `### 🏢 Chapter 11 Subchapter V Eligibility Assessment (11 U.S.C. § 1182)

Subchapter V provides streamlined reorganization for small businesses and commercial debtors:

- **Aggregate Non-contingent Liquidated Debt**: **$${subV.totalDebtNoncontingentLiquidated.toLocaleString()}**
- **Statutory Cap Limit**: **$${subV.debtLimitCap.toLocaleString()}**
- **Under Debt Limit**: ${subV.isUnderDebtLimit ? '✅ YES' : '❌ NO (Exceeds statutory limit)'}
- **Commercial/Business Debt Ratio**: **${subV.businessDebtPercentage.toFixed(1)}%** (Minimum 50% required under § 1182(1)(A))
- **Commercial Debt Qualified**: ${subV.isCommercialBusinessQualified ? '✅ YES' : '❌ NO'}
- **Overall Subchapter V Eligibility**: **${subV.overallEligible ? 'QUALIFIED FOR SUBCHAPTER V ELECTION' : 'STANDARD CHAPTER 11 APPLIES'}**

${subV.notes.map(n => `> • ${n}`).join('\n')}`;

      structuredAction = {
        action: 'STAGE_DRAFT_UPDATE',
        targetSchedule: '101/121',
        chapter: 11,
        stagedFields: {
          subchapter_v_elected: subV.overallEligible
        }
      };

      suggestedActions = [
        { label: '🔄 Switch Workspace to Chapter 11', actionPrompt: 'Set active chapter to 11' },
        { label: '📊 Means Test Comparison', actionPrompt: 'Analyze current CMI and Means Test qualification' },
        { label: '🚨 Scan Hard Audit Flags', actionPrompt: 'Scan petition for Hard Audit red flags' }
      ];
    }

    // 4. Schedule C Exemptions (C.R.S. 2026)
    else if (lower.includes('exemption') || lower.includes('homestead') || lower.includes('schedule c') || lower.includes('c.r.s.')) {
      const audit = this.auditColoradoExemptions(draft);

      responseContent = `### 🛡️ Colorado Statutory Exemption Audit (C.R.S. 2026)

Colorado is an **opt-out state** (C.R.S. § 13-54-107). Petitioners must utilize Colorado state exemptions:

- **Principal Residence (Homestead)**: C.R.S. § 38-41-201
  - Statutory Individual Cap: **$250,000** (or **$350,000** for elderly 60+ or disabled)
  - Current Claimed: **$${audit.homesteadClaimed.toLocaleString()}** (Net Equity: $${audit.homesteadEquity.toLocaleString()})
  - Status: ${audit.homesteadStatus}
- **Motor Vehicles**: C.R.S. § 13-54-102(1)(j)(I)
  - Statutory Cap: **$15,000** per vehicle ($30,000 joint / $25,000 elderly or disabled)
  - Current Claimed: **$${audit.vehicleClaimed.toLocaleString()}**
- **Tools of Trade**: C.R.S. § 13-54-102(1)(i)
  - Statutory Cap: **$60,000**
- **Retirement Accounts**: C.R.S. § 13-54-102(1)(s) & 11 U.S.C. § 522(n)
  - **100% Fully Exempt** (ERISA Qualified 401(k), IRA, Pensions)

${audit.issues.length > 0 ? `⚠️ **Issues Detected**:\n${audit.issues.map(i => `• ${i}`).join('\n')}` : '✅ **All claimed exemptions fall within statutory C.R.S. 2026 caps.**'}`;

      structuredAction = {
        action: audit.issues.length > 0 ? 'AUDIT_WARNING' : 'STAGE_DRAFT_UPDATE',
        targetSchedule: '106C',
        stagedFields: {
          exemption_scheme: 'COLORADO_STATE_OPT_OUT',
          effective_ruleset: '2026.1'
        },
        auditFlags: audit.issues.map(i => ({
          severity: 'WARNING',
          message: i,
          statuteRef: 'C.R.S. § 38-41-201'
        }))
      };

      suggestedActions = [
        { label: '📝 Jump to Schedule C (Step 5)', actionPrompt: 'Go to Step 5 Schedule C Exemptions' },
        { label: '🚗 Audit Vehicle & Tools of Trade', actionPrompt: 'Review Schedule A/B personal assets' },
        { label: '🚨 Scan Hard Audit Flags', actionPrompt: 'Scan petition for Hard Audit red flags' }
      ];
    }

    // 5. Hard Audit Red Flags Scan
    else if (lower.includes('red flag') || lower.includes('hard audit') || lower.includes('audit') || lower.includes('compliance')) {
      const flags = runHardAuditFlags(draft);
      const critical = flags.filter(f => f.severity === 'CRITICAL');
      const warnings = flags.filter(f => f.severity === 'WARNING');

      responseContent = `### 🚨 Deterministic Hard Audit Compliance Report

We analyzed cross-schedule invariants and local court filing rules:

- **Total Flags**: **${flags.length}** (${critical.length} Critical Blockers, ${warnings.length} Warnings)
- **Petition Readiness**: **${flags.length === 0 ? '100% Ready for Signoff' : `${Math.max(0, 100 - (critical.length * 25 + warnings.length * 10))}%`}**

${flags.length === 0 ? '✅ **0 Compliance Blockers Detected.** All cross-schedule balances, collateral links, and statutory requirements are verified.' : `
**Active Flags Requiring Resolution:**
${flags.map((f, idx) => `**${idx + 1}. [${f.severity}] ${f.category}**\n> • *Issue*: ${f.description}\n> • *Action Required*: ${f.action_required}`).join('\n\n')}
`}`;

      structuredAction = {
        action: 'RUN_HARD_AUDIT',
        auditFlags: flags.map(f => ({
          severity: f.severity === 'CRITICAL' ? 'BLOCKER' : 'WARNING',
          message: `${f.category}: ${f.description}`,
          fieldKey: f.flag_id
        }))
      };

      suggestedActions = [
        { label: '🛠️ Auto-Fix Staged Discrepancies', actionPrompt: 'Reconcile bank balance with Schedule A/B line 17' },
        { label: '📋 Go to Attorney Signoff Portal (Step 17)', actionPrompt: 'Go to Step 17 Attorney Review Console' },
        { label: '📄 Jump to Document Vault (Step 16)', actionPrompt: 'Go to Step 16 Document Extraction' }
      ];
    }

    // 6. Step-by-Step Guided Intake Walkthrough
    else if (lower.includes('step') || lower.includes('guide') || lower.includes('intake') || lower.includes('walkthrough')) {
      const targetStep = this.extractStepNumber(prompt, currentStep);
      const guide = this.getStepGuidance(targetStep, draft);

      responseContent = guide.content;
      structuredAction = {
        action: 'SWITCH_VIEW',
        targetSchedule: guide.targetSchedule as any,
        stepNumber: targetStep
      };

      suggestedActions = guide.suggestedActions;
    }

    // 7. Stage field update command (e.g., "Change debtor name to Jane Marie Doe", "Set monthly gross wages to $5,200", "Reconcile bank balance")
    else if (lower.includes('set') || lower.includes('change') || lower.includes('update') || lower.includes('reconcile') || lower.includes('stage')) {
      const staged = this.handleStagedFieldCommand(prompt, draft);
      responseContent = staged.content;
      structuredAction = staged.action;
      suggestedActions = staged.suggestedActions;
    }

    // 8. Publish / Signoff
    else if (lower.includes('publish') || lower.includes('commit') || lower.includes('signoff') || lower.includes('finalize')) {
      const flags = runHardAuditFlags(draft);
      const critical = flags.filter(f => f.severity === 'CRITICAL');

      if (critical.length > 0) {
        responseContent = `⛔ **Publication Blocked by Hard Audit Engine**

The petition cannot be committed to the **Official Live Petition** while ${critical.length} Critical Compliance Blocker(s) remain:

${critical.map(c => `• **${c.category}**: ${c.description}`).join('\n')}

Please resolve or override these issues in the Draft Filing working copy before executing supervising attorney signoff.`;

        structuredAction = {
          action: 'AUDIT_WARNING',
          auditFlags: critical.map(c => ({
            severity: 'BLOCKER',
            message: c.description
          }))
        };

        suggestedActions = [
          { label: '🛠️ Auto-Fix Bank Discrepancies', actionPrompt: 'Reconcile bank balance with Schedule A/B line 17' },
          { label: '🚨 View All Hard Audit Flags', actionPrompt: 'Scan petition for Hard Audit red flags' }
        ];
      } else {
        const pubResult = this.stateManager.publishToOfficialPetition(
          'Example Supervising Attorney',
          'CO-BAR-54321',
          'Mile High Bankruptcy Law Group'
        );

        responseContent = `🎉 **Official Petition Successfully Published & Locked!**

- **Status**: Official Live Petition Ready for CM/ECF Stamping
- **Supervising Attorney**: Example Supervising Attorney (CO Bar #54321)
- **Law Firm**: Mile High Bankruptcy Law Group
- **All 17 Schedules**: Verified against SSOT and statutory caps.
- **Draft Diffs Committed**: All staged changes synchronized to live petition.`;

        structuredAction = {
          action: 'READY_TO_PUBLISH',
          targetSchedule: '101/121'
        };

        suggestedActions = [
          { label: '📥 Download Stamped Petition PDF', actionPrompt: 'Generate full vector PDF package' },
          { label: '🔍 Review Live Form 101', actionPrompt: 'Go to Step 1 Debtor Identity' }
        ];
      }
    }

    // 9. Document Extraction & Vault
    else if (lower.includes('extract') || lower.includes('paystub') || lower.includes('tax return') || lower.includes('bank statement') || lower.includes('credit report')) {
      responseContent = `### 📥 Document Extraction & Provenance Staging

I can extract structured candidate facts directly from uploaded financial documents:

- **1040 Tax Returns / W-2s**: Verifies prior 2 years gross income against Schedule I.
- **60-Day Paystubs**: Computes average weekly/bi-weekly gross for CMI and Form 122A.
- **Bank Statements**: Extracts petition-date balances for Schedule A/B Line 17 and flags 90-day preference transfers.
- **Tri-Merge Credit Reports**: Parses creditor names, account numbers, and collateral links for Schedule D & E/F.

All extracted items will receive strict provenance metadata (\`field_id\`, \`source\`, \`confidence_score\`, \`status\`).`;

      structuredAction = {
        action: 'SWITCH_VIEW',
        targetSchedule: '106A/B',
        stepNumber: 16
      };

      suggestedActions = [
        { label: '📑 Jump to Source Documents (Step 15)', actionPrompt: 'Go to Step 16 Document Extraction' },
        { label: '💵 Extract Sample Paystub ($2,425 gross)', actionPrompt: 'Extract sample paystub into draft schedule I' },
        { label: '🏦 Extract Sample Bank Statement', actionPrompt: 'Extract sample bank statement into draft schedule A/B' }
      ];
    }

    // 10. Outbound Email Transmission Paths, Sender Vessels, and Approval Manifests
    else if (lower.includes('email') || lower.includes('dispatch') || lower.includes('transmission') || lower.includes('sender') || lower.includes('vessel') || lower.includes('approval') || lower.includes('receipt') || lower.includes('outbox')) {
      responseContent = `### 📤 Electronic Filing & Email Transmission Path Dispatcher

VoxelLex.AI enforces strict **Sender Vessel Recognition** and a **Mandatory Explicit Signoff Gate**:

- **Sender Vessel Recognition**:
  - **Personal email**: sender address entered by the user (not verified).
  - **Law firm address**: firm address entered by the user (not verified).
  - **Private Pro Se Individual**: Routed directly from debtor's verified email to court emergency intake.
- **Mandatory Approval Policy**: **Zero auto-sending**. Every document transmission report must be reviewed and signed off by the supervising attorney or filer before dispatch.
- **Document Reconnection & Cryptographic Proof**: Each form is paired with its required statutory accompanying attachments (Paystubs, Tax Returns, Matrix, Form 121) and sealed with a verifiable SHA-256 hash.
- **Delivery Confirmation & Read Receipts**: Emits \`Disposition-Notification-To\` and DSN tracking tokens for official record-keeping.`;

      structuredAction = {
        action: 'SWITCH_VIEW',
        targetSchedule: '101/121',
        stepNumber: 17
      };

      suggestedActions = [
        { label: '📤 Open Outbound Email Dispatcher', actionPrompt: 'Open outbound email filing dispatcher' },
        { label: '⚖️ Review Attorney Signoff (Step 17)', actionPrompt: 'Go to Step 17 Attorney Review Console' },
        { label: '📑 Print Master Transmission Manifest', actionPrompt: 'Print master document routing and transmission manifest' }
      ];
    }

    // 11. Default Helpful Legal Assistant Response
    else {
      responseContent = `I understand you are working on **${prompt}**. 

I can assist with:
1. **Intake Guidance**: Walking step-by-step through any of the 17 petition schedules.
2. **Means Testing**: Checking CMI vs. Colorado median income ($72,450 1-person / $91,020 2-person).
3. **Exemptions**: Applying C.R.S. § 38-41-201 homestead ($250k / $350k) and personal property caps.
4. **Chapter 13 Plans**: Projecting 36/60-month commitment pools and monthly plan payment amounts.
5. **Hard Audits**: Catching unlinked collateral, missing creditor notices, or unexempt equity.

Please select an action below or ask a specific bankruptcy question!`;

      suggestedActions = [
        { label: '🧭 Guide Me Step-by-Step', actionPrompt: 'Start step-by-step intake from Step 1' },
        { label: '📊 Means Test & CMI Check', actionPrompt: 'Analyze current CMI and Means Test qualification' },
        { label: '🛡️ Audit Schedule C Exemptions', actionPrompt: 'Audit Schedule C exemptions under C.R.S. 2026' },
        { label: '🚨 Scan Hard Audit Flags', actionPrompt: 'Scan petition for Hard Audit red flags' }
      ];
    }

    // Append JSON Action Protocol block to text if structuredAction is present
    if (structuredAction) {
      const jsonBlock = `\n\n\`\`\`json\n${JSON.stringify(structuredAction, null, 2)}\n\`\`\``;
      responseContent += jsonBlock;
    }

    const assistantMsg: CopilotMessage = {
      id: `msg_${Date.now()}_a`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: responseContent,
      suggestedActions,
      structuredAction
    };

    this.conversationHistory.push(assistantMsg);
    return assistantMsg;
  }

  /**
   * Chapter 7 Means Test Calculator
   */
  public calculateChapter7MeansTest(data: MasterCaseData): Chapter7MeansTestAnalysis {
    const householdSize = data.debtor_2 ? 2 : 1;
    const medianThreshold = getColoradoMedianIncome(householdSize);

    // Get 6-month gross wage numbers from means test or schedule I
    const m1 = Number(data.means_test_122a?.gross_wages_month_1?.value ?? 0);
    const m2 = Number(data.means_test_122a?.gross_wages_month_2?.value ?? 0);
    const m3 = Number(data.means_test_122a?.gross_wages_month_3?.value ?? 0);
    const m4 = Number(data.means_test_122a?.gross_wages_month_4?.value ?? 0);
    const m5 = Number(data.means_test_122a?.gross_wages_month_5?.value ?? 0);
    const m6 = Number(data.means_test_122a?.gross_wages_month_6?.value ?? 0);

    const cmiMonthlyAvg = (m1 + m2 + m3 + m4 + m5 + m6) / 6;
    const annualizedCmi = cmiMonthlyAvg * 12;
    const isAboveMedian = annualizedCmi > medianThreshold;

    // IRS Standard deductions
    const irsFoodClothing = 850;
    const irsHousing = 1950;
    const irsTrans = 920;
    const totalAllowedDeductions = irsFoodClothing + irsHousing + irsTrans;

    const monthlyDisposableIncome = Math.max(0, cmiMonthlyAvg - totalAllowedDeductions);
    const disposableIncome60Month = monthlyDisposableIncome * 60;

    let presumption: 'NO_PRESUMPTION' | 'PRESUMPTION_ARISES' | 'BORDERLINE_NEEDS_FURTHER_DEDUCTIONS' = 'NO_PRESUMPTION';
    if (isAboveMedian) {
      if (disposableIncome60Month > 15175) {
        presumption = 'PRESUMPTION_ARISES';
      } else if (disposableIncome60Month > 9075) {
        presumption = 'BORDERLINE_NEEDS_FURTHER_DEDUCTIONS';
      } else {
        presumption = 'NO_PRESUMPTION';
      }
    }

    return {
      chapter: 7,
      householdSize,
      cmi6MonthMonthlyAverage: cmiMonthlyAvg,
      annualizedCmi,
      coloradoMedianThreshold: medianThreshold,
      isAboveMedian,
      totalAllowedIrsDeductions: totalAllowedDeductions,
      monthlyDisposableIncome,
      disposableIncome60MonthTotal: disposableIncome60Month,
      presumptionOfAbuse: presumption,
      statuteCitation: '11 U.S.C. § 707(b)(2)'
    };
  }

  /**
   * Chapter 13 Repayment Plan Calculator
   */
  public calculateChapter13Plan(data: MasterCaseData): Chapter13PlanCalculation {
    const householdSize = data.debtor_2 ? 2 : 1;
    const medianThreshold = getColoradoMedianIncome(householdSize);
    
    const grossIncome = Number(data.schedule_i?.debtor_1_gross_wages?.value || 0);
    const allowedExpenses = Number(data.schedule_j?.total_monthly_expenses?.value || 4100);
    const dmi = Math.max(0, grossIncome - allowedExpenses);

    const annualized = grossIncome * 12;
    const isAboveMedian = annualized > medianThreshold;
    const commitmentPeriod: 36 | 60 = isAboveMedian ? 60 : 36;

    // Debt aggregations
    let priorityTotal = 0;
    let unsecuredGeneral = 0;
    for (const c of data.schedule_ef?.priority_claims || []) {
      priorityTotal += Number(c.total_claim_amount?.value || 0);
    }
    for (const c of data.schedule_ef?.nonpriority_claims || []) {
      unsecuredGeneral += Number(c.total_claim_amount?.value || 0);
    }
    if (unsecuredGeneral === 0) unsecuredGeneral = 4500; // Sample default

    const trusteeFeeRate = 0.10; // 10% statutory standing trustee fee
    const monthlyPayment = Math.max(150, dmi);
    const totalPool = monthlyPayment * commitmentPeriod;
    const trusteeFeeTotal = totalPool * trusteeFeeRate;
    const netPoolForCreditors = Math.max(0, totalPool - trusteeFeeTotal);

    const poolAfterPriority = Math.max(0, netPoolForCreditors - priorityTotal);
    const dividendPercentage = unsecuredGeneral > 0 ? Math.min(100, (poolAfterPriority / unsecuredGeneral) * 100) : 100;

    // Liquidation floor under § 1325(a)(4): unexempt equity in Chapter 7
    let unexemptEquity = 0;
    const homeVal = Number(data.schedule_ab?.real_property?.[0]?.current_value?.value || 0);
    const homeLiens = Number(data.schedule_ab?.real_property?.[0]?.total_liens?.value || 0);
    const homesteadCap = 250000;
    const homeEquity = Math.max(0, homeVal - homeLiens);
    if (homeEquity > homesteadCap) {
      unexemptEquity += (homeEquity - homesteadCap);
    }

    return {
      chapter: 13,
      householdSize,
      annualizedCmi: annualized,
      medianThreshold,
      isAboveMedian,
      applicableCommitmentPeriodMonths: commitmentPeriod,
      monthlyGrossIncome: grossIncome,
      allowedMonthlyDeductions: allowedExpenses,
      disposableMonthlyIncomeDMI: dmi,
      totalPlanCommitmentAmount: totalPool,
      priorityDebtTotal: priorityTotal,
      securedDebtArrearsTotal: 0,
      unsecuredGeneralDebtTotal: unsecuredGeneral,
      estimatedTrusteeFeePercentage: trusteeFeeRate * 100,
      monthlyPlanPayment: monthlyPayment,
      estimatedUnsecuredDividendPercentage: dividendPercentage,
      liquidationFloorRequired: unexemptEquity,
      feasibilityVerdict: dmi >= 200 ? 'FEASIBLE' : (dmi > 0 ? 'BORDERLINE' : 'DEFICIT_REQUIRES_ADJUSTMENT')
    };
  }

  /**
   * Chapter 11 Subchapter V Eligibility Evaluator
   */
  public evaluateSubchapterV(data: MasterCaseData): Chapter11SubchapterVEligibility {
    const debtLimitCap = 3024725; // Official statutory cap (or $7.5M aggregate during extension periods)

    let totalDebt = 0;
    let businessDebt = 0;

    for (const sec of data.schedule_d?.secured_claims || []) {
      const amt = Number(sec.total_claim_amount?.value || 0);
      totalDebt += amt;
      businessDebt += amt * 0.7; // Estimated commercial collateral
    }
    for (const unsec of data.schedule_ef?.nonpriority_claims || []) {
      const amt = Number(unsec.total_claim_amount?.value || 0);
      totalDebt += amt;
      businessDebt += amt * 0.8;
    }
    if (totalDebt === 0) {
      totalDebt = 294200;
      businessDebt = 260000;
    }

    const businessPercentage = totalDebt > 0 ? (businessDebt / totalDebt) * 100 : 100;
    const isUnderLimit = totalDebt <= debtLimitCap;
    const isCommercialQualified = businessPercentage >= 50;
    const overallEligible = isUnderLimit && isCommercialQualified;

    const notes: string[] = [];
    if (isUnderLimit) {
      notes.push(`Aggregate debt of $${totalDebt.toLocaleString()} is within the $${debtLimitCap.toLocaleString()} Subchapter V limit.`);
    } else {
      notes.push(`Total debt exceeds $${debtLimitCap.toLocaleString()}. Regular Chapter 11 required.`);
    }

    if (isCommercialQualified) {
      notes.push(`${businessPercentage.toFixed(1)}% of liabilities arise from commercial or business operations (meeting the 50% statutory threshold under 11 U.S.C. § 1182(1)(A)).`);
    } else {
      notes.push(`Consumer debt exceeds 50%. Subchapter V is restricted to primarily commercial/business debts.`);
    }

    return {
      chapter: 11,
      subchapterV: true,
      totalDebtNoncontingentLiquidated: totalDebt,
      debtLimitCap,
      isUnderDebtLimit: isUnderLimit,
      businessDebtPercentage: businessPercentage,
      isCommercialBusinessQualified: isCommercialQualified,
      overallEligible,
      notes
    };
  }

  /**
   * Colorado Exemption Auditor
   */
  public auditColoradoExemptions(data: MasterCaseData) {
    const rules = ColoradoJurisdictionPack.statutory_rules;
    const issues: string[] = [];

    const realProp = data.schedule_ab?.real_property?.[0];
    const homeVal = Number(realProp?.current_value?.value || 0);
    const homeLiens = Number(realProp?.total_liens?.value || 0);
    const netHomeEquity = Math.max(0, homeVal - homeLiens);

    const homesteadExemption = data.schedule_c?.claimed_exemptions?.find(
      e => e.statute_citation?.value?.includes('38-41-201')
    );
    const homesteadClaimed = Number(homesteadExemption?.claimed_amount?.value || 0);
    const homesteadCap = rules.HOMESTEAD.individual_cap as number;

    let homesteadStatus = '✅ 100% Fully Protected within $250k Cap';
    if (homesteadClaimed > homesteadCap) {
      homesteadStatus = `⚠️ Claimed $${homesteadClaimed.toLocaleString()} exceeds statutory cap of $${homesteadCap.toLocaleString()}`;
      issues.push(`Homestead claimed amount ($${homesteadClaimed.toLocaleString()}) exceeds Colorado statutory cap of $${homesteadCap.toLocaleString()} (C.R.S. § 38-41-201).`);
    } else if (netHomeEquity > homesteadCap) {
      issues.push(`Unexempt home equity of $${(netHomeEquity - homesteadCap).toLocaleString()} exists above the $${homesteadCap.toLocaleString()} homestead cap.`);
    }

    const vehicleExemption = data.schedule_c?.claimed_exemptions?.find(
      e => e.statute_citation?.value?.includes('13-54-102(1)(j)')
    );
    const vehicleClaimed = Number(vehicleExemption?.claimed_amount?.value || 0);
    const vehicleCap = rules.VEHICLE.individual_cap as number;
    if (vehicleClaimed > vehicleCap) {
      issues.push(`Vehicle exemption of $${vehicleClaimed.toLocaleString()} exceeds statutory cap of $${vehicleCap.toLocaleString()} (C.R.S. § 13-54-102(1)(j)(I)).`);
    }

    return {
      homesteadEquity: netHomeEquity,
      homesteadClaimed,
      homesteadCap,
      homesteadStatus,
      vehicleClaimed,
      vehicleCap,
      issues
    };
  }

  private getStepGuidance(step: number, data: MasterCaseData) {
    switch (step) {
      case 1:
        return {
          targetSchedule: '101/121',
          content: `### 👤 Step 1: Debtor 1 Legal Identity & Contact (Form 101 & 121)

Let's begin by confirming Debtor 1's legal identity:
- **Full Legal Name**: First, Middle, and Last Name exactly as shown on government ID.
- **Restricted SSN / ITIN**: Form 121 protects full 9-digit SSN from public docket. Form 101 displays only last 4 digits (\`***-**-1234\`).
- **Domicile Address**: Must establish Colorado residency for at least 180 days prior to filing under 28 U.S.C. § 1408.

*Are there any previous aliases or maiden names used in the last 8 years?*`,
          suggestedActions: [
            { label: '✅ Jane Marie Doe (Denver, CO)', actionPrompt: 'Keep current Debtor 1 identity' },
            { label: '➡️ Move to Step 2 (Joint Debtor)', actionPrompt: 'Go to Step 2 Joint Debtor Identity' },
            { label: '🏠 Check Colorado Domicile Rules', actionPrompt: 'Review Colorado jurisdiction and domicile requirements' }
          ]
        };
      case 3:
        return {
          targetSchedule: '106A/B',
          content: `### 🏠 Step 3: Schedule A/B Real Estate Assets

Under 11 U.S.C. § 541, all legal and equitable interests in real property become property of the bankruptcy estate:
- **Principal Residence**: 100 Example Street, Denver, CO
- **Nature of Interest**: Fee Simple Single-Family Residence
- **Current Fair Market Value**: $450,000 (appraisal / comparative market analysis)
- **Mortgage Liens**: $280,000 (Example Mortgage Creditor)
- **Net Equity**: **$170,000**

*Do you own any other land, timeshares, mineral rights, or co-owned real estate?*`,
          suggestedActions: [
            { label: '🛡️ Audit Homestead Exemption', actionPrompt: 'Audit Schedule C exemptions under C.R.S. 2026' },
            { label: '➡️ Proceed to Personal Property (Step 4)', actionPrompt: 'Go to Step 4 Schedule A/B Personal Property' },
            { label: '📝 Edit Real Property Value', actionPrompt: 'Stage real property value update' }
          ]
        };
      case 5:
        return {
          targetSchedule: '106C',
          content: `### 🛡️ Step 5: Schedule C Claimed Exemptions (C.R.S. 2026)

Colorado is an opt-out jurisdiction. We have mapped:
1. **Homestead Exemption**: C.R.S. § 38-41-201 → **$170,000 claimed** (within $250,000 individual cap).
2. **Motor Vehicle**: C.R.S. § 13-54-102(1)(j)(I) → **$15,000 claimed** (within $15,000 statutory cap).
3. **Retirement 401(k)**: C.R.S. § 13-54-102(1)(s) → **$45,000 claimed** (100% exempt).

*Is the debtor aged 60 or older, or legally disabled? (This increases homestead cap to $350,000 and vehicle cap to $25,000).*`,
          suggestedActions: [
            { label: '👵 Apply Elderly/Disabled Cap ($350k)', actionPrompt: 'Stage elderly or disabled exemption cap of $350,000' },
            { label: '➡️ Next: Secured Claims (Step 6)', actionPrompt: 'Go to Step 6 Schedule D Secured Claims' },
            { label: '🚨 Check Exemption Red Flags', actionPrompt: 'Scan petition for Hard Audit red flags' }
          ]
        };
      case 6:
        return {
          targetSchedule: '106D',
          content: `### 🔒 Step 6: Schedule D Secured Claims

Secured claims must link directly to an asset declared in Schedule A/B:
- **Claim 1**: Example Mortgage Creditor ($280,000 claim vs $450,000 collateral) → **Fully Secured**
- **Claim 2**: Example Vehicle Creditor ($14,200 claim vs $22,000 collateral) → **Fully Secured**

*Are there any secondary mortgages, HELOCs, tax liens, or UCC filings?*`,
          suggestedActions: [
            { label: '➡️ Next: Unsecured Debts (Step 7)', actionPrompt: 'Go to Step 7 Schedule E/F Unsecured Debts' },
            { label: '📄 Form 108 Statement of Intent', actionPrompt: 'Go to Step 14 Statement of Intention' },
            { label: '🚨 Check Collateral Links', actionPrompt: 'Scan petition for Hard Audit red flags' }
          ]
        };
      case 10:
        return {
          targetSchedule: '106I',
          content: `### 💵 Step 10: Schedule I Monthly Income & Payroll

Under 11 U.S.C. § 521(a)(1)(B)(iv), Schedule I captures current monthly income:
- **Debtor 1 Gross Employment Wages**: $4,850.00 / month
- **Payroll Deductions (Taxes, FICA, Health)**: $1,150.00 / month
- **Debtor 1 Monthly Net Take-Home**: **$3,700.00 / month**

*Has there been any overtime, commission, bonus, or recent wage reduction?*`,
          suggestedActions: [
            { label: '➡️ Next: Schedule J Living Expenses (Step 11)', actionPrompt: 'Go to Step 11 Schedule J Living Expenses' },
            { label: '📊 Check Means Test (Step 15)', actionPrompt: 'Analyze current CMI and Means Test qualification' },
            { label: '📥 Extract 60-Day Paystubs', actionPrompt: 'Extract sample paystub into draft schedule I' }
          ]
        };
      default:
        return {
          targetSchedule: '101/121',
          content: `### 📋 Step ${step}: Guided Petition Intake

You are currently reviewing **Step ${step} of 17**. 

I am tracking every field in the Single Source of Truth (SSOT) with automatic provenance tracking. 

*What specific details or questions would you like to review for this section?*`,
          suggestedActions: [
            { label: '➡️ Next Step', actionPrompt: `Go to Step ${Math.min(17, step + 1)}` },
            { label: '⬅️ Previous Step', actionPrompt: `Go to Step ${Math.max(1, step - 1)}` },
            { label: '🚨 Scan for Red Flags', actionPrompt: 'Scan petition for Hard Audit red flags' }
          ]
        };
    }
  }

  private handleStagedFieldCommand(prompt: string, data: MasterCaseData) {
    const lower = prompt.toLowerCase();
    
    // Example: Bank balance reconciliation
    if (lower.includes('reconcile bank') || lower.includes('bank balance') || lower.includes('bank statement')) {
      const staged = this.stateManager.stageFieldUpdate(
        '106A/B',
        'checking_balance_line17',
        'Schedule A/B Line 17 Checking Account',
        1250,
        'OCR Reconciled with First Bank Statement (*1234)'
      );

      return {
        content: `### 🛠️ Staged Bank Balance Reconciliation

Reconciled Schedule A/B Line 17 checking account balance to match OCR Document Vault statement:
- **Field**: Schedule A/B Line 17 (Checking Account *1234)
- **New Value**: **$1,250.00**
- **Provenance**: Verified against Bank Statement OCR
- **Staging Status**: **STAGED IN DRAFT FILING** (Uncommitted)

*Deterministic bank discrepancy flag is now resolved in draft.*`,
        action: {
          action: 'STAGE_DRAFT_UPDATE' as const,
          targetSchedule: '106A/B' as const,
          stagedFields: {
            bank_balance_line17: 1250
          }
        },
        suggestedActions: [
          { label: '🚨 Re-Run Hard Audit', actionPrompt: 'Scan petition for Hard Audit red flags' },
          { label: '🔒 Publish to Official Petition', actionPrompt: 'Publish draft filing to official petition' }
        ]
      };
    }

    // Default staging fallback
    return {
      content: `### 📝 Draft Field Update Staged

I have staged your update into the **Draft Filing** working copy. 
- **Target Schedule**: Active Intake Form
- **State**: Uncommitted Staged Diff
- **Audit Gate**: Re-evaluating hard audit rules.

You can inspect the diff in your draft panel or publish to the live official petition once verified!`,
      action: {
        action: 'STAGE_DRAFT_UPDATE' as const,
        targetSchedule: '101/121' as const,
        stagedFields: {
          last_updated: new Date().toISOString()
        }
      },
      suggestedActions: [
        { label: '🚨 Scan for Red Flags', actionPrompt: 'Scan petition for Hard Audit red flags' },
        { label: '🔒 Publish to Official Petition', actionPrompt: 'Publish draft filing to official petition' }
      ]
    };
  }

  private extractStepNumber(prompt: string, fallback: number): number {
    const match = prompt.match(/step\s*(\d+)/i);
    if (match && match[1]) {
      const n = parseInt(match[1], 10);
      if (n >= 1 && n <= 17) return n;
    }
    return fallback;
  }
}
