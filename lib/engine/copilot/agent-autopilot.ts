import type { MasterCaseData } from '../../types/master-case';
import type { DualStateManager } from './dual-state-manager';
import type { BankruptcyCopilotEngine } from './copilot-engine';

export interface AgentStepExecution {
  stepNumber: number;
  title: string;
  formId: string;
  officialName: string;
  signaturesRequired: string;
  docketStatus: 'PUBLIC_DOCKET' | 'SEALED_RESTRICTED' | 'INFORMATIONAL_SCHEDULE';
  deliveryRouting: {
    primaryMethod: string;
    agency: string;
    details: string;
  };
  crossPollinationTargets: string[];
  clientDescription: string;
  proceduralQuestion: {
    question: string;
    citation: string;
    options: Array<{
      label: string;
      actionText: string;
      patch: Record<string, any>;
    }>;
  };
  actionSummary: string;
}

export const AGENT_STEP_EXECUTIONS: Record<number, AgentStepExecution> = {
  1: {
    stepNumber: 1,
    title: 'Debtor 1 Legal Identity & Contact',
    formId: 'form101',
    officialName: 'Official Form 101 & Form 121 (Voluntary Petition & Statement of SSN)',
    signaturesRequired: 'Debtor 1 (/s/ Jane Marie Doe) & Supervising Attorney (/s/ Colorado Bar #)',
    docketStatus: 'PUBLIC_DOCKET',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado (Denver Division)',
      details: '721 19th St, Room 400, Denver CO 80202 | Form 121 is sealed under Fed. R. Bankr. P. 9037.'
    },
    crossPollinationTargets: ['Master Caption', 'Form 101 Pt 1', 'Form 121 (Sealed)', 'Schedule Headers', 'Mailing Matrix'],
    clientDescription: 'Jane Marie Doe, residing at 1420 S. University Blvd, Denver CO 80210 (resided in CO > 3 years, establishing venue under 28 U.S.C. § 1408).',
    proceduralQuestion: {
      question: 'Has Debtor resided within the District of Colorado for the greater part of the last 180 days?',
      citation: '28 U.S.C. § 1408 (Bankruptcy Venue Rules)',
      options: [
        { label: '✓ Yes — Colorado Venue Established (> 180 Days)', actionText: 'Confirmed Colorado venue established under 28 U.S.C. § 1408.', patch: { venue_established: true } },
        { label: '⚠️ No — Prior State Law May Apply to Exemptions', actionText: 'Flagged debtor residency < 730 days; opt-out analysis may require prior state law under 11 U.S.C. § 522(b)(3)(A).', patch: { venue_established: false } }
      ]
    },
    actionSummary: 'Populated Debtor 1 legal name, SSN/ITIN, residential address, Colorado residency venue, and consumer debt election.'
  },
  2: {
    stepNumber: 2,
    title: 'Joint Debtor 2 Legal Identity',
    formId: 'form101',
    officialName: 'Official Form 101 Part 2 & Form 121 (Spousal Joint Petition)',
    signaturesRequired: 'Debtor 2 (/s/ Joint Debtor) if joint petition elected',
    docketStatus: 'PUBLIC_DOCKET',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Included in initial voluntary petition filing packet ($338 statutory filing fee covers both spouses).'
    },
    crossPollinationTargets: ['Form 101 Pt 2', 'Form 121 Spousal Section', 'Means Test Median Calculation (HH Size 2)', 'Homestead Double-Cap Review'],
    clientDescription: 'Filing individual debtor petition. Debtor 2 (Spouse) is non-filing, living in the marital community.',
    proceduralQuestion: {
      question: 'Is the debtor filing individually, or jointly with a spouse under 11 U.S.C. § 302?',
      citation: '11 U.S.C. § 302 (Joint Cases)',
      options: [
        { label: '👤 Individual Debtor Only (Spouse Non-Filing)', actionText: 'Configured as individual Chapter 7 debtor with single household income.', patch: { joint_debtor: false } },
        { label: '👥 Joint Petition with Spouse (§ 302)', actionText: 'Added Joint Debtor 2 (John David Doe); household size expanded to 2 with double exemption provisions.', patch: { joint_debtor: true } }
      ]
    },
    actionSummary: 'Verified individual filing status, confirmed spouse non-filing status, and established single-filer threshold.'
  },
  3: {
    stepNumber: 3,
    title: 'Schedule A/B Real Estate Assets',
    formId: 'form106ab',
    officialName: 'Official Form 106A/B Part 1 (Schedule A: Real Property)',
    signaturesRequired: 'Referenced and affirmed under penalty of perjury in Form 106Dec',
    docketStatus: 'INFORMATIONAL_SCHEDULE',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Included in main schedules packet. Chapter 7 Panel Trustee conducts title verification before § 341 meeting.'
    },
    crossPollinationTargets: ['Schedule C (C.R.S. § 38-41-201 Homestead)', 'Schedule D (Chase 1st Mortgage)', 'Schedule J (Housing Expense)', 'Form 108 (Statement of Intention)'],
    clientDescription: 'Primary single-family residence located at 1420 S. University Blvd, Denver, CO 80210. Fair market value: $415,000. 1st mortgage balance: $265,000. Net equity: $150,000.',
    proceduralQuestion: {
      question: 'Does the debtor own any timeshares, fractional interests, or secondary vacant land in Colorado?',
      citation: 'Fed. R. Bankr. P. 1007(b)(1)',
      options: [
        { label: '🏡 Sole Primary Residence Only ($415,000 FMV)', actionText: 'Scheduled single primary residence with 100% homestead protection under Colorado law.', patch: { real_property_count: 1 } },
        { label: '🏔️ Additional Land / Mineral Rights Present', actionText: 'Flagged secondary mineral rights in Weld County for trustee title examination.', patch: { mineral_rights: true } }
      ]
    },
    actionSummary: 'Recorded Denver residential real estate, established fee simple ownership, fair market valuation, and mortgage lien balance.'
  },
  4: {
    stepNumber: 4,
    title: 'Schedule A/B Personal Property',
    formId: 'form106ab',
    officialName: 'Official Form 106A/B Parts 2–8 (Schedule B: Personal Property)',
    signaturesRequired: 'Referenced and affirmed in Form 106Dec',
    docketStatus: 'INFORMATIONAL_SCHEDULE',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Bank statements confirming petition-date balances must be submitted to Chapter 7 Trustee under 11 U.S.C. § 521(a)(1)(B)(iv).'
    },
    crossPollinationTargets: ['Schedule C (Vehicle & Household Exemptions)', 'Schedule D (Ally Auto Loan)', 'Schedule J (Auto Payment)', 'Hard Audit Reconciliation (Line 17.1 Bank Account)'],
    clientDescription: '2021 Subaru Outback AWD ($21,500 FMV), FirstBank Checking ($1,420.50 ending balance), Household Furniture ($3,200), Electronics ($1,100), Clothing ($900), ERISA Qualified 401(k) ($38,400).',
    proceduralQuestion: {
      question: 'Are there any expected tax refund rights or active personal injury claims?',
      citation: '11 U.S.C. § 541(a)(1)',
      options: [
        { label: '✓ Standard Personal Assets Only (No Claims/Refunds)', actionText: 'Verified personal property schedule includes checking, vehicle, and retirement savings.', patch: { personal_property_verified: true } },
        { label: '⚖️ Active Contingent Claim / Pending Lawsuit', actionText: 'Recorded contingent claim on Schedule A/B line 33 and flagged for Schedule C wild-card / exemption audit.', patch: { contingent_claims: true } }
      ]
    },
    actionSummary: 'Populated 6 asset categories (vehicles, bank accounts, household furnishings, clothing, tools, and ERISA 401k).'
  },
  5: {
    stepNumber: 5,
    title: 'Schedule C Colorado Statutory Exemptions',
    formId: 'form106c',
    officialName: 'Official Form 106C (The Property You Claim as Exempt under C.R.S. 2026)',
    signaturesRequired: 'Referenced and affirmed in Form 106Dec',
    docketStatus: 'INFORMATIONAL_SCHEDULE',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Trustee has 30 days post-341 meeting to object to claimed exemptions under Fed. R. Bankr. P. 4003(b).'
    },
    crossPollinationTargets: ['Schedule A/B (100% Protected Assets)', 'Liquidation Analysis (Floor: $0 unexempt equity)', 'Attorney Hard Audit Verification'],
    clientDescription: 'Colorado State Opt-Out Exemptions (C.R.S. § 13-54-107): Homestead ($150,000 claimed under § 38-41-201), Motor Vehicle ($12,000 claimed under § 13-54-102(1)(j)(I)), Household Goods ($3,200 under § 13-54-102(1)(c)), 401k (100% exempt under § 13-54-102(1)(s)).',
    proceduralQuestion: {
      question: 'Is the debtor elderly (age 60+) or disabled, qualifying for the enhanced $350,000 Colorado homestead exemption?',
      citation: 'C.R.S. § 38-41-201(2)',
      options: [
        { label: '🛡️ Standard Debtor Rate ($250,000 Homestead Cap)', actionText: 'Applied standard C.R.S. § 38-41-201 individual homestead cap of $250,000.', patch: { homestead_cap: 250000 } },
        { label: '👵 Elderly (60+) or Disabled Rate ($350,000 Homestead Cap)', actionText: 'Applied enhanced C.R.S. § 38-41-201(2) elderly/disabled homestead cap of $350,000.', patch: { homestead_cap: 350000 } }
      ]
    },
    actionSummary: 'Applied Colorado opt-out statutory citations, protected $150,000 home equity, motor vehicle, and retirement accounts with $0 unexempt equity.'
  },
  6: {
    stepNumber: 6,
    title: 'Schedule D Secured Claims & Mortgages',
    formId: 'form106d',
    officialName: 'Official Form 106D (Creditors Who Have Claims Secured by Property)',
    signaturesRequired: 'Referenced and affirmed in Form 106Dec',
    docketStatus: 'INFORMATIONAL_SCHEDULE',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Secured creditors receive automatic electronic ECF notice. 11 U.S.C. § 362 automatic stay immediately halts any pending foreclosure.'
    },
    crossPollinationTargets: ['Schedule A/B (Lien Deductions)', 'Form 108 (Statement of Intention)', 'Schedule J (Mortgage & Auto Installments)', 'Master Creditor Matrix'],
    clientDescription: 'Chase Home Lending ($265,000 1st mortgage on Denver home) and Ally Financial ($9,500 auto loan on 2021 Subaru). Both claims are 100% fully secured by collateral equity.',
    proceduralQuestion: {
      question: 'Are there any mortgage or auto loan payments past due / in arrears?',
      citation: '11 U.S.C. § 506(a)',
      options: [
        { label: '✓ All Secured Loans are Current (No Arrears)', actionText: 'Scheduled Chase and Ally claims as current with $0 prepetition arrearage.', patch: { arrears_total: 0 } },
        { label: '⚠️ Mortgage Arrearage Present (Consider Ch 13 Cure)', actionText: 'Recorded $8,400 mortgage arrearage; evaluated Chapter 13 plan feasibility under § 1322(b)(5).', patch: { arrears_total: 8400 } }
      ]
    },
    actionSummary: 'Linked collateral assets to Chase Home Lending ($265,000) and Ally Financial ($9,500); confirmed $0 prepetition arrears.'
  },
  7: {
    stepNumber: 7,
    title: 'Schedule E/F Priority & General Unsecured Debts',
    formId: 'form106ef',
    officialName: 'Official Form 106E/F (Creditors Who Have Unsecured Claims)',
    signaturesRequired: 'Referenced and affirmed in Form 106Dec',
    docketStatus: 'INFORMATIONAL_SCHEDULE',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'All listed unsecured creditors are extracted into the official Master Matrix and receive notice of § 341 meeting from Court Clerk.'
    },
    crossPollinationTargets: ['Master Creditor Matrix', 'Means Test Form 122A (Abuse Screening)', 'Chapter 13 Dividend Calculation'],
    clientDescription: 'Priority Claims: $0 (No domestic support obligations or priority taxes). Nonpriority General Unsecured: Chase Bank USA ($8,450), Discover ($4,280), UCHealth University Hospital ($3,120), Synchrony / Amazon ($1,850). Total: $17,700.',
    proceduralQuestion: {
      question: 'Are there any outstanding IRS, Colorado Department of Revenue, or child support obligations?',
      citation: '11 U.S.C. § 507(a)(8)',
      options: [
        { label: '✓ No Priority Debts (Pure Credit Card & Medical Bills)', actionText: 'Scheduled 4 nonpriority general unsecured accounts ($17,700 total) eligible for complete discharge.', patch: { priority_claims: 0 } },
        { label: '🏛️ Priority Tax Debt Present (1040 Back Taxes)', actionText: 'Scheduled priority income tax claim under 11 U.S.C. § 507(a)(8) requiring full statutory payout.', patch: { priority_claims: 4200 } }
      ]
    },
    actionSummary: 'Added 4 unsecured creditor accounts with official billing addresses and account numbers; verified $0 priority claims.'
  },
  8: {
    stepNumber: 8,
    title: 'Schedule G Executory Contracts & Leases',
    formId: 'form106g',
    officialName: 'Official Form 106G (Executory Contracts and Unexpired Leases)',
    signaturesRequired: 'Referenced and affirmed in Form 106Dec',
    docketStatus: 'INFORMATIONAL_SCHEDULE',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Included in schedules package. Landlords or leasing agencies receive official court notification.'
    },
    crossPollinationTargets: ['Schedule J (Lease Expense Check)', 'Master Creditor Matrix', 'Form 108'],
    clientDescription: 'Debtor owns home; no unexpired residential leases, vehicle leases, or commercial executory contracts exist.',
    proceduralQuestion: {
      question: 'Does the debtor hold any active vehicle leases, apartment leases, or storage unit contracts?',
      citation: '11 U.S.C. § 365',
      options: [
        { label: '✓ None (Homeowner with no active executory leases)', actionText: 'Recorded no unexpired executory contracts on Schedule G.', patch: { contracts_count: 0 } },
        { label: '📑 Active Residential Apartment Lease to Assume', actionText: 'Added residential lease with Denver Property Management; marked for assumption under § 365.', patch: { assume_lease: true } }
      ]
    },
    actionSummary: 'Verified absence of unexpired personal or real property leases under 11 U.S.C. § 365.'
  },
  9: {
    stepNumber: 9,
    title: 'Schedule H Codebtors & Guarantors',
    formId: 'form106h',
    officialName: 'Official Form 106H (Your Codebtors)',
    signaturesRequired: 'Referenced and affirmed in Form 106Dec',
    docketStatus: 'INFORMATIONAL_SCHEDULE',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Codebtors receive notice of bankruptcy petition and automatic stay protections.'
    },
    crossPollinationTargets: ['Master Creditor Matrix', 'Chapter 13 Codebtor Stay (§ 1301)'],
    clientDescription: 'No codebtors, guarantors, or co-signers on any scheduled debts.',
    proceduralQuestion: {
      question: 'Did any relative, business partner, or friend co-sign on any loans or credit accounts?',
      citation: '11 U.S.C. § 1301 & Fed. R. Bankr. P. 1007(b)',
      options: [
        { label: '✓ No Codebtors or Co-signers', actionText: 'Recorded zero codebtors on Schedule H.', patch: { codebtors_count: 0 } },
        { label: '👥 Parent or Relative Co-signed Auto Loan', actionText: 'Added co-signer on Ally Financial loan; evaluated codebtor protection under federal law.', patch: { codebtor_present: true } }
      ]
    },
    actionSummary: 'Confirmed no third-party guarantors or co-signers exist on scheduled debts.'
  },
  10: {
    stepNumber: 10,
    title: 'Schedule I Debtor Monthly Income',
    formId: 'form106i',
    officialName: 'Official Form 106I (Your Income - Individual Monthly Budget)',
    signaturesRequired: 'Referenced and affirmed in Form 106Dec',
    docketStatus: 'INFORMATIONAL_SCHEDULE',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Paystubs covering 60 days prior to filing must be served on Chapter 7 Trustee at least 7 days prior to 341 meeting.'
    },
    crossPollinationTargets: ['Means Test Form 122A-1 (Line 1 CMI)', 'Schedule J Net Cash Flow (Line 11)', 'Chapter 13 Plan Feasibility'],
    clientDescription: 'Employed at Rocky Mountain Logistics Inc. (Dispatch Coordinator, 4 yrs). Monthly gross wages: $5,850.00. Mandatory deductions: $1,500.00 ($1,220 taxes/FICA + $280 health insurance). Net Monthly Take-Home: $4,350.00.',
    proceduralQuestion: {
      question: 'Does the debtor expect any substantial increase or decrease in earnings within the next 12 months?',
      citation: '11 U.S.C. § 521(a)(1)(B)(iv) & Fed. R. Bankr. P. 1007(b)(1)(E)',
      options: [
        { label: '✓ Income is Stable ($5,850/mo Gross)', actionText: 'Scheduled regular employment wages with Rocky Mountain Logistics Inc.', patch: { income_stable: true } },
        { label: '📉 Anticipated Reduction in Overtime / Hours', actionText: 'Recorded explanation on Schedule I line 13 detailing anticipated reduction in overtime.', patch: { income_decrease: true } }
      ]
    },
    actionSummary: 'Documented $5,850 monthly gross earnings, payroll withholdings, and $4,350 net monthly take-home pay.'
  },
  11: {
    stepNumber: 11,
    title: 'Schedule J Household Living Expenses',
    formId: 'form106j',
    officialName: 'Official Form 106J (Your Expenses - Monthly Living Expenses)',
    signaturesRequired: 'Referenced and affirmed in Form 106Dec',
    docketStatus: 'INFORMATIONAL_SCHEDULE',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Included in main petition schedules. Trustee evaluates reasonableness under totality of circumstances.'
    },
    crossPollinationTargets: ['Net Monthly Cash Flow ($4,350 - $4,120 = +$230)', 'Form 122A-2 Deduction Standards', 'Chapter 13 DMI Pool'],
    clientDescription: 'Mortgage: $1,850, Utilities: $350, Food/Housekeeping: $750, Auto Gas/Maintenance: $420, Vehicle Loan: $450, Insurance: $180, Medical Out-of-Pocket: $180. Total Monthly Expenses: $4,120.00.',
    proceduralQuestion: {
      question: 'Does monthly disposable income ($230/mo) represent reasonable and necessary living expenses?',
      citation: '11 U.S.C. § 707(b)(3) (Totality of Circumstances)',
      options: [
        { label: '✓ Expenses Realistic & Balanced (+$230/mo Net)', actionText: 'Net surplus of $230/mo confirmed as safe operating reserve without triggering § 707(b)(3) scrutiny.', patch: { expenses_reasonable: true } },
        { label: '📈 Higher Health / Childcare Expenses to Deduct', actionText: 'Adjusted healthcare expenses to reflect ongoing chronic prescription costs.', patch: { higher_medical: true } }
      ]
    },
    actionSummary: 'Scheduled itemized household living expenses totaling $4,120, yielding a stable net monthly cash flow of +$230.'
  },
  12: {
    stepNumber: 12,
    title: 'Schedule J-2 Separate Debtor 2 Household',
    formId: 'form106j2',
    officialName: 'Official Form 106J-2 (Expenses for Separate Household of Debtor 2)',
    signaturesRequired: 'Referenced and affirmed in Form 106Dec if applicable',
    docketStatus: 'INFORMATIONAL_SCHEDULE',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Only required in joint cases where married debtors maintain separate legal households.'
    },
    crossPollinationTargets: ['Schedule J Combined Totals', 'Form 106Dec'],
    clientDescription: 'Marked N/A. Debtor 1 maintains a single consolidated household.',
    proceduralQuestion: {
      question: 'Does a joint debtor or spouse maintain a separate physical residence?',
      citation: 'Fed. R. Bankr. P. 1007(b)(1)',
      options: [
        { label: '✓ Single Household (Form 106J-2 Not Required)', actionText: 'Verified single household configuration; Schedule J-2 marked N/A.', patch: { separate_hh: false } },
        { label: '🏠 Separate Household Maintained', actionText: 'Activated Form 106J-2 for separate spousal living expenses.', patch: { separate_hh: true } }
      ]
    },
    actionSummary: 'Verified single household status; Form 106J-2 declared not applicable.'
  },
  13: {
    stepNumber: 13,
    title: 'Statement of Financial Affairs (SOFA)',
    formId: 'sofa107',
    officialName: 'Official Form 107 (Statement of Financial Affairs for Individuals)',
    signaturesRequired: 'Debtor 1 (/s/ Jane Marie Doe) under penalty of perjury',
    docketStatus: 'PUBLIC_DOCKET',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'U.S. Trustee reviews SOFA for preferential transfers, insider transactions, and fraudulent conveyances.'
    },
    crossPollinationTargets: ['Schedule I Historical Revenue', 'Trustee Audit Checklist', 'Hard Audit Engine'],
    clientDescription: 'Disclosed 3-year gross income: 2025 ($68,400), 2024 ($65,200), 2023 ($61,800). Disclosed zero lawsuits, zero property transfers outside ordinary course, and zero insider preference payments > $600.',
    proceduralQuestion: {
      question: 'Were any payments exceeding $600 made to relatives, business partners, or insider creditors within the last 12 months?',
      citation: '11 U.S.C. § 547(b)(4)(B) (Insider Preference Avoidance)',
      options: [
        { label: '✓ No Insider Payments or Preferential Transfers', actionText: 'Recorded zero insider payments; confirmed no avoidable preference claims under § 547.', patch: { insider_transfers: false } },
        { label: '⚠️ Transfer to Family Member Made within 1 Year', actionText: 'Disclosed $2,500 repayment to family member on SOFA line 7 for trustee disclosure.', patch: { insider_transfers: true } }
      ]
    },
    actionSummary: 'Completed 28 statutory SOFA questions, documenting 3-year income history and confirming zero preferential transfers.'
  },
  14: {
    stepNumber: 14,
    title: 'Statement of Intention',
    formId: 'intention108',
    officialName: 'Official Form 108 (Statement of Intention for Individuals Filing Chapter 7)',
    signaturesRequired: 'Debtor 1 (/s/ Jane Marie Doe)',
    docketStatus: 'PUBLIC_DOCKET',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado',
      details: 'Copy must be served on secured creditors (Chase and Ally) within 30 days of filing under 11 U.S.C. § 521(a)(2)(A).'
    },
    crossPollinationTargets: ['Schedule D Secured Creditors', 'Reaffirmation Agreement Tracking', 'Court Creditor Notices'],
    clientDescription: 'Chase Home Mortgage: Retain property and continue regular contract payments. Ally Financial Subaru Loan: Retain vehicle and enter into formal Reaffirmation Agreement under 11 U.S.C. § 524(c).',
    proceduralQuestion: {
      question: 'Does the debtor intend to reaffirm the vehicle loan with Ally Financial or retain without reaffirmation?',
      citation: '11 U.S.C. § 521(a)(2) & 11 U.S.C. § 524(c)',
      options: [
        { label: '🚗 Reaffirm and Retain Vehicle (11 U.S.C. § 524(c))', actionText: 'Selected formal Reaffirmation Agreement with Ally Financial on Form 108.', patch: { ally_intention: 'REAFFIRM' } },
        { label: '🔑 Surrender Vehicle to Lender', actionText: 'Selected surrender of motor vehicle; scheduled deficiency claim under Schedule E/F.', patch: { ally_intention: 'SURRENDER' } }
      ]
    },
    actionSummary: 'Declared statutory intentions to retain home and reaffirm auto loan within 30-day statutory window.'
  },
  15: {
    stepNumber: 15,
    title: 'Means Test Calculation & AI Document Vault',
    formId: 'meansTest',
    officialName: 'Official Form 122A-1 / 122A-2 (Chapter 7 Statement of Monthly Income & Means Test)',
    signaturesRequired: 'Debtor 1 (/s/ Jane Marie Doe) under penalty of perjury',
    docketStatus: 'PUBLIC_DOCKET',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado & U.S. Trustee Region 19',
      details: 'U.S. Trustee reviews Form 122A-1 within 10 days of § 341 meeting to file Statement of Presumed Abuse or No Abuse.'
    },
    crossPollinationTargets: ['Schedule I Gross Wages', 'Colorado Median Threshold ($78,450)', 'Presumption of Abuse Verdict', 'Document Vault Provenance'],
    clientDescription: '6-Month Current Monthly Income (CMI): $4,850.00/mo ($58,200 annualized vs Colorado Median of $78,450 for 1-person). Presumption of abuse does NOT arise under 11 U.S.C. § 707(b)(2). Safe Harbor Established.',
    proceduralQuestion: {
      question: 'Does the debtor qualify for the statutory Safe Harbor under 11 U.S.C. § 707(b)(7)?',
      citation: '11 U.S.C. § 707(b)(7) (Safe Harbor Exception to Means Test)',
      options: [
        { label: '✓ Below Median Safe Harbor ($58,200 < $78,450 Limit)', actionText: 'Safe Harbor established! Form 122A-2 expense deductions not required.', patch: { safe_harbor: true } },
        { label: '⚠️ Above Median Income (Form 122A-2 Required)', actionText: 'Annualized CMI exceeds median; executed Form 122A-2 IRS National and Local expense deductions.', patch: { safe_harbor: false } }
      ]
    },
    actionSummary: 'Calculated 6-month CMI average, compared against Colorado median limit, and confirmed Chapter 7 Safe Harbor qualification.'
  },
  16: {
    stepNumber: 16,
    title: 'Supervising Attorney Review, ECF Gateway & Outbound Dispatch',
    formId: 'fullPacket',
    officialName: 'Official Form 106Dec, Master Petition Packet & Certified Outbox Manifest',
    signaturesRequired: 'Debtor 1 (/s/), Joint Debtor (/s/ if joint), and Supervising Attorney (/s/ Christopher Bailey, CO Bar #49182)',
    docketStatus: 'PUBLIC_DOCKET',
    deliveryRouting: {
      primaryMethod: 'NextGen CM/ECF Electronic Filing Portal',
      agency: 'U.S. Bankruptcy Court for the District of Colorado (Denver Division)',
      details: 'Supervising Attorney retains original wet-ink signatures for 3 years post-case closure under Local Bankruptcy Rule 5005-4.'
    },
    crossPollinationTargets: ['All 15 Court Schedules', 'Master Creditor Matrix (.txt)', 'Hard Audit Certification', 'Certified Transmission Manifest'],
    clientDescription: 'Case is fully prepared, zero hard audit blockers remain, all 15 schedules reconciled. Gated in "Waiting for Attorney Approval" until supervising counsel signs under ABA Model Rule 5.3.',
    proceduralQuestion: {
      question: 'Has supervising counsel reviewed all field provenance, statutory exemptions, and signed the ABA Rule 5.3 declaration?',
      citation: 'ABA Model Rule 5.3 & District of Colorado Local Rule 5005-4',
      options: [
        { label: '⚖️ Execute Attorney Signoff & Authorize CM/ECF Filing', actionText: 'Supervising Attorney Christopher Bailey executed signoff. Petition unlocked for transmission!', patch: { attorney_approved: true } },
        { label: '⏳ Maintain "Waiting for Attorney Approval" Status', actionText: 'Maintained strict review hold pending formal supervisory counsel consultation.', patch: { attorney_approved: false } }
      ]
    },
    actionSummary: 'Compiled complete 15-form petition packet, verified 0 hard audit flags, and engaged supervising attorney approval gate.'
  }
};

export class BankruptcyAutopilotAgent {
  private stateManager: DualStateManager;
  private copilotEngine: BankruptcyCopilotEngine;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private currentStep: number = 1;
  private onStepChangeCallback?: (step: number, execution: AgentStepExecution) => void;
  private onStatusUpdateCallback?: (statusText: string, isWaitingForApproval: boolean) => void;
  private onAutopilotCompleteCallback?: () => void;
  private timeoutHandle: any = null;

  constructor(stateManager: DualStateManager, copilotEngine: BankruptcyCopilotEngine) {
    this.stateManager = stateManager;
    this.copilotEngine = copilotEngine;
  }

  public setCallbacks(
    onStepChange: (step: number, execution: AgentStepExecution) => void,
    onStatusUpdate: (statusText: string, isWaitingForApproval: boolean) => void,
    onComplete: () => void
  ) {
    this.onStepChangeCallback = onStepChange;
    this.onStatusUpdateCallback = onStatusUpdate;
    this.onAutopilotCompleteCallback = onComplete;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getCurrentStep(): number {
    return this.currentStep;
  }

  public startAutopilot(fromStep: number = 1) {
    this.isRunning = true;
    this.isPaused = false;
    this.currentStep = fromStep;
    if (this.onStatusUpdateCallback) {
      this.onStatusUpdateCallback(`🤖 Autopilot Active: Executing Step ${this.currentStep} of 16...`, true);
    }
    this.runStepLoop();
  }

  public pauseAutopilot() {
    this.isPaused = true;
    if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    if (this.onStatusUpdateCallback) {
      this.onStatusUpdateCallback(`⏸️ Autopilot Paused at Step ${this.currentStep} of 16.`, true);
    }
  }

  public resumeAutopilot() {
    if (!this.isRunning) {
      this.startAutopilot(this.currentStep);
      return;
    }
    this.isPaused = false;
    if (this.onStatusUpdateCallback) {
      this.onStatusUpdateCallback(`🤖 Autopilot Resumed: Executing Step ${this.currentStep} of 16...`, true);
    }
    this.runStepLoop();
  }

  public stopAutopilot() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    if (this.onStatusUpdateCallback) {
      this.onStatusUpdateCallback(`⏹️ Autopilot Stopped.`, true);
    }
  }

  public executeSingleStep(stepNumber: number) {
    const execution = AGENT_STEP_EXECUTIONS[stepNumber];
    if (!execution) return;

    this.currentStep = stepNumber;
    this.executeStepPayload(stepNumber, execution);

    if (this.onStepChangeCallback) {
      this.onStepChangeCallback(stepNumber, execution);
    }

    if (this.onStatusUpdateCallback) {
      const isWaitingApproval = stepNumber === 16;
      this.onStatusUpdateCallback(
        isWaitingApproval ? '⏳ WAITING FOR SUPERVISING ATTORNEY APPROVAL (ABA Rule 5.3 Gate)' : `Completed Step ${stepNumber}: ${execution.title}`,
        isWaitingApproval
      );
    }
  }

  private runStepLoop() {
    if (!this.isRunning || this.isPaused) return;

    if (this.currentStep > 16) {
      this.isRunning = false;
      if (this.onStatusUpdateCallback) {
        this.onStatusUpdateCallback('⏳ ALL 16 STEPS EXECUTED — WAITING FOR SUPERVISING ATTORNEY APPROVAL', true);
      }
      if (this.onAutopilotCompleteCallback) {
        this.onAutopilotCompleteCallback();
      }
      return;
    }

    const execution = AGENT_STEP_EXECUTIONS[this.currentStep];
    if (execution) {
      this.executeStepPayload(this.currentStep, execution);
      if (this.onStepChangeCallback) {
        this.onStepChangeCallback(this.currentStep, execution);
      }
    }

    this.currentStep++;

    if (this.currentStep <= 16) {
      this.timeoutHandle = setTimeout(() => {
        this.runStepLoop();
      }, 1200); // 1.2s delay for clean visual walkthrough
    } else {
      this.timeoutHandle = setTimeout(() => {
        this.runStepLoop();
      }, 600);
    }
  }

  private executeStepPayload(stepNumber: number, execution: AgentStepExecution) {
    // 1. Send Assistant guidance and log message to Copilot feed
    const promptSummary = `🤖 [Agent Autopilot Executing Step ${stepNumber}/16]: ${execution.title}\n\n` +
      `**Form Generated**: \`${execution.officialName}\`\n` +
      `**Signatures**: ${execution.signaturesRequired}\n` +
      `**Routing & Delivery**: ${execution.deliveryRouting.primaryMethod} (${execution.deliveryRouting.agency})\n` +
      `**Cross-Pollination**: → ${execution.crossPollinationTargets.join(', ')}\n\n` +
      `**Action Taken**: ${execution.actionSummary}`;

    this.copilotEngine.processUserPrompt(promptSummary, stepNumber);

    // 2. Stage corresponding Master Case data in DualStateManager
    switch (stepNumber) {
      case 1:
        this.stateManager.stageFieldUpdate('Debtor 1', 'first_name', 'First Name', 'Jane', 'Agent Autopilot');
        this.stateManager.stageFieldUpdate('Debtor 1', 'last_name', 'Last Name', 'Doe', 'Agent Autopilot');
        this.stateManager.stageFieldUpdate('Debtor 1', 'middle_name', 'Middle Name', 'Marie', 'Agent Autopilot');
        this.stateManager.stageFieldUpdate('Debtor 1', 'street_address', 'Street Address', '1420 S. University Blvd', 'Agent Autopilot');
        this.stateManager.stageFieldUpdate('Debtor 1', 'city', 'City', 'Denver', 'Agent Autopilot');
        this.stateManager.stageFieldUpdate('Debtor 1', 'state', 'State', 'CO', 'Agent Autopilot');
        this.stateManager.stageFieldUpdate('Debtor 1', 'zip_code', 'Zip Code', '80210', 'Agent Autopilot');
        break;

      case 3:
      case 4:
        this.stateManager.stageFieldUpdate('Schedule A/B', 'total_real_property', 'Total Real Property', 415000, 'Agent Autopilot');
        this.stateManager.stageFieldUpdate('Schedule A/B', 'total_personal_property', 'Total Personal Property', 66120.50, 'Agent Autopilot');
        break;

      case 5:
        this.stateManager.stageFieldUpdate('Schedule C', 'total_claimed_exemption_amount', 'Total Claimed Exemptions', 204500, 'Agent Autopilot');
        break;

      case 6:
        this.stateManager.stageFieldUpdate('Schedule D', 'total_secured_claims_amount', 'Total Secured Claims', 274500, 'Agent Autopilot');
        break;

      case 7:
        this.stateManager.stageFieldUpdate('Schedule E/F', 'total_unsecured_claims', 'Total Unsecured Claims', 17700, 'Agent Autopilot');
        break;

      case 10:
        this.stateManager.stageFieldUpdate('Schedule I', 'total_monthly_gross_wages', 'Gross Monthly Wages', 5850, 'Agent Autopilot');
        this.stateManager.stageFieldUpdate('Schedule I', 'total_combined_monthly_income', 'Combined Monthly Income', 4350, 'Agent Autopilot');
        break;

      case 11:
        this.stateManager.stageFieldUpdate('Schedule J', 'total_monthly_expenses', 'Total Monthly Expenses', 4120, 'Agent Autopilot');
        break;

      case 15:
        this.stateManager.stageFieldUpdate('Means Test 122A', 'gross_wages_past_6_months', 'Gross Wages (6 Mo)', 29100, 'Agent Autopilot');
        break;

      default:
        break;
    }
  }
}
