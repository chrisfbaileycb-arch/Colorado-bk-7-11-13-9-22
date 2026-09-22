/**
 * Comprehensive Document Routing, Filing Next-Steps & Transmission Guide
 * 
 * Provides annotated court filing directions, physical drop-off locations, mailing addresses,
 * email and ECF gateways, fax numbers, deadlines, and statutory retention rules
 * for every document generated throughout the bankruptcy process in the District of Colorado.
 */

export interface DocumentRoutingInfo {
  formId: string;
  officialFormNumber: string;
  title: string;
  category: 'PETITION_CORE' | 'SCHEDULES' | 'FINANCIAL_STATEMENTS' | 'MEANS_TEST' | 'CONFIDENTIAL' | 'SUPPORTING';
  summary: string;
  whereToMail: {
    denverDivision: string;
    coloradoSpringsDivision: string;
    grandJunctionDivision: string;
    attention: string;
  };
  whereToEmail: {
    ecfGatewayUrl: string;
    proSeEmergencyEmail: string;
    usTrusteeEmail: string;
    trusteeDocumentPortal: string;
  };
  whereToDropOff: {
    denverDropBox: string;
    coloradoSpringsDropBox: string;
    grandJunctionDropBox: string;
    hours: string;
    securityNotes: string;
  };
  whereToFax: {
    courtClerkEmergencyFax: string;
    usTrusteeFax: string;
    creditorEmergencyStayFax: string;
    faxPermissibilityRules: string;
  };
  statutoryDeadlines: string[];
  mandatoryAttachments: string[];
  publicDocketStatus: 'PUBLIC_DOCKET' | 'SEALED_NON_PUBLIC' | 'TRUSTEE_ONLY_NOT_DOCKETED';
  wetSignatureRetentionRule: string;
  nextStepsChecklist: string[];
}

export const COLORADO_DOCUMENT_ROUTING_REGISTRY: Record<string, DocumentRoutingInfo> = {
  form101: {
    formId: 'form101',
    officialFormNumber: 'Official Form 101',
    title: 'Voluntary Petition for Individuals Filing for Bankruptcy',
    category: 'PETITION_CORE',
    summary: 'The primary 8-page jurisdictional filing initiating the bankruptcy case and invoking the nationwide Automatic Stay under 11 U.S.C. § 362.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, District of Colorado, Byron G. Rogers U.S. Courthouse, 721 19th Street, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Avenue, Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, Wayne Aspinall Federal Building, 400 Rood Avenue, Room 216, Grand Junction, CO 81501',
      attention: 'Intake Clerk / New Case Filings Desk'
    },
    whereToEmail: {
      ecfGatewayUrl: 'https://ecf.cob.uscourts.gov (NextGen CM/ECF Login Required for Attorneys)',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov (Pro Se Emergency Petitions Only)',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov (Office of the U.S. Trustee - Region 19)',
      trusteeDocumentPortal: 'Transmit case docket number to assigned Chapter 7 Panel Trustee upon receipt of NEF'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse 1st Floor Security Lobby (After-hours 24/7 time-stamp repository; intake counter open M-F 8:00 AM - 4:30 PM)',
      coloradoSpringsDropBox: 'Plaza of the Rockies South Tower, 1st Floor Federal Clerk Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Security Desk Intake',
      hours: 'Counter: Mon-Fri 8:00 AM - 4:30 PM MDT (Excluding Federal Holidays); 24/7 Drop Box',
      securityNotes: 'Government-issued photo ID required for building entry. Enclose filing fee check/money order in sealed envelope.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999 (Emergency Stay Filings only upon prior Telephonic Clerk Approval: 303-335-2900)',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'Transmit certified Page 1 stamped copy directly to foreclosing Sheriff, levying Constable, or garnishing Bank',
      faxPermissibilityRules: 'Court allows fax submission for emergency stay stop only; original signed petition must follow within 48 hours.'
    },
    statutoryDeadlines: [
      'Immediate upon filing: Automatic stay (§ 362) halts garnishments, repossessions, foreclosures, and lawsuits.',
      '14 Days after Bare-Bones Filing: Schedules A/B-J, SOFA 107, and Means Test must be completed if not filed simultaneously (Fed. R. Bankr. P. 1007(c)).'
    ],
    mandatoryAttachments: [
      'Credit Counseling Certificate (received within 180 days prior to filing)',
      'Creditor Address Matrix (raw ASCII .txt format)',
      'Form 121 (Statement About Social Security Numbers)',
      'Filing Fee: $338.00 (or Application to Pay in Installments Form 103A / IFP Waiver Form 103B)'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Under Local Bankruptcy Rule 5005-4, the filing attorney must retain the original paper document bearing the debtor\'s ink wet signature for 3 years after the case is closed.',
    nextStepsChecklist: [
      'Execute Debtor 1 (and Debtor 2 if joint) wet or certified digital signature on Part 8 of Form 101.',
      'Supervising Attorney executes signature block with Colorado Bar Registration number.',
      'Submit via CM/ECF or deliver to Clerk with filing fee of $338.00.',
      'Verify issuance of Notice of Electronic Filing (NEF) and 7-digit Case Number.',
      'Serve Notice of Bankruptcy on creditors scheduled for emergency foreclosure/garnishment.'
    ]
  },

  form121: {
    formId: 'form121',
    officialFormNumber: 'Official Form 121',
    title: 'Your Statement About Your Social Security Numbers',
    category: 'CONFIDENTIAL',
    summary: 'MANDATORY CONFIDENTIAL FILING: Discloses full 9-digit SSN/ITIN to the Court and credit reporting repositories. NEVER PLACED ON PUBLIC DOCKET.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, District of Colorado, 721 19th St, Room 400, Denver, CO 80202 (Mark envelope: CONFIDENTIAL SEALED FORM 121)',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Avenue, Room 216, Grand Junction, CO 81501',
      attention: 'Sealed Records Intake Clerk'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Event: "Statement of Social Security Number (Form 121)" [Restricted Sealed Document Event - Auto-Masked from Public PACER]',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov (Subject: CONFIDENTIAL FORM 121 - [Debtor Name])',
      usTrusteeEmail: 'Provided automatically through restricted BAP/ECF court feed',
      trusteeDocumentPortal: 'Do not email over unencrypted channels'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window in sealed envelope marked "SEALED SOCIAL SECURITY STATEMENT - NOT FOR PUBLIC INSPECTION"',
      coloradoSpringsDropBox: 'Courthouse Dropbox in sealed security envelope',
      grandJunctionDropBox: 'Courthouse Intake in sealed security envelope',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Redacted versions on other forms show last 4 digits only (e.g., XXX-XX-1234). Form 121 contains the only unredacted 9-digit number.'
    },
    whereToFax: {
      courtClerkEmergencyFax: 'DO NOT FAX UNENCRYPTED PII (SSN) without prior Clerk authorization.',
      usTrusteeFax: 'Not accepted via unencrypted fax.',
      creditorEmergencyStayFax: 'NEVER SEND FORM 121 TO CREDITORS (Protects debtor against identity theft).',
      faxPermissibilityRules: 'Restricted under Fed. R. Bankr. P. 9037 and Judicial Conference Privacy Policy.'
    },
    statutoryDeadlines: [
      'Must be submitted concurrently with initial petition filing on Day 1 (Fed. R. Bankr. P. 1007(f)).',
      'Failure to file may result in immediate dismissal without notice within 14 days.'
    ],
    mandatoryAttachments: [
      'Copy of Social Security Card or official SSA-1099 statement for Trustee 341 identification verification.'
    ],
    publicDocketStatus: 'SEALED_NON_PUBLIC',
    wetSignatureRetentionRule: 'Supervising attorney must retain debtor\'s original ink-signed Form 121 for 3 years post-discharge (L.B.R. 5005-4).',
    nextStepsChecklist: [
      'Verify that all 9 digits of SSN/ITIN match official government tax records exactly.',
      'Ensure debtor signs the declaration under penalty of perjury.',
      'File electronically under the specific restricted SEALED CM/ECF event code.',
      'Prepare original physical Social Security card to present to Chapter 7 Trustee at § 341 meeting.'
    ]
  },

  form106ab: {
    formId: 'form106ab',
    officialFormNumber: 'Official Form 106A/B',
    title: 'Schedule A/B: Property (Real Estate & Personal Assets)',
    category: 'SCHEDULES',
    summary: 'Comprehensive itemization of all real property interests (principal residence, land) and personal property (vehicles, accounts, household goods, claims).',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Event: "Schedules A-J" (Included in Master Schedules Package)',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Send appraisals, vehicle titles, and bank statements to Trustee document portal 7 days prior to 341 meeting.'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Security Lobby Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies South Tower Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Include 1 original and 1 copy if paper filing.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'N/A',
      faxPermissibilityRules: 'Part of omnibus schedules filing.'
    },
    statutoryDeadlines: [
      'Due with Petition or within 14 days of emergency filing (Fed. R. Bankr. P. 1007(c)).',
      'Duty to amend immediately if new assets, inheritances, or tax refunds arise during case (11 U.S.C. § 541(a)(5)).'
    ],
    mandatoryAttachments: [
      'Schedule C (Exemptions Claimed on Listed Property)',
      'Schedule D (Secured Claims encumbering real estate and vehicles)'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Schedule A/B for 3 years post-case closing.',
    nextStepsChecklist: [
      'Cross-check all bank account balances as of the exact date of petition filing.',
      'Verify vehicle Kelley Blue Book (KBB) private party valuation methodology.',
      'Confirm real estate valuation with current county assessor or appraisal report.',
      'Ensure every listed asset has a corresponding Schedule C exemption entry.'
    ]
  },

  form106c: {
    formId: 'form106c',
    officialFormNumber: 'Official Form 106C',
    title: 'Schedule C: The Property You Claim as Exempt',
    category: 'SCHEDULES',
    summary: 'Protects debtor assets from bankruptcy liquidation using Colorado opt-out statutory exemption caps (C.R.S. 2026).',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Schedules Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Provide retirement 401(k)/IRA plan qualifying trust documents to Trustee.'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Check Colorado opt-out box on Part 1 (C.R.S. § 13-54-107).'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'N/A',
      faxPermissibilityRules: 'Part of omnibus schedules filing.'
    },
    statutoryDeadlines: [
      'Creditors & Trustee have 30 days AFTER conclusion of the § 341 meeting to file objections to claimed exemptions (Fed. R. Bankr. P. 4003(b)).'
    ],
    mandatoryAttachments: [
      'Schedule A/B (Underlying Property References)'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Schedule C for 3 years post-case closing.',
    nextStepsChecklist: [
      'Verify statutory exemption caps: Homestead (C.R.S. § 38-41-201: $250k / $350k), Vehicle (C.R.S. § 13-54-102(1)(j)(I): $15k / $25k).',
      'Verify 100% exemption citation on qualified ERISA retirement accounts (C.R.S. § 13-54-102(1)(s)).',
      'Confirm double exemption amounts if joint filing married debtors.',
      'Check for unexempt equity that would require Chapter 7 Trustee liquidation or Chapter 13 plan payout.'
    ]
  },

  form106d: {
    formId: 'form106d',
    officialFormNumber: 'Official Form 106D',
    title: 'Schedule D: Creditors Who Have Claims Secured by Property',
    category: 'SCHEDULES',
    summary: 'Itemizes mortgages, deeds of trust, vehicle liens, statutory tax liens, and judicial judgment liens.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Schedules Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Provide mortgage statements and vehicle loan payoff statements to Trustee.'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Include creditor payment addresses for matrix matching.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'Fax stamped petition to secured lender to stop imminent foreclosure sale or vehicle repo',
      faxPermissibilityRules: 'Emergency notification only.'
    },
    statutoryDeadlines: [
      'File within 14 days of petition.',
      'Form 108 Statement of Intention must be executed for all secured consumer debts within 30 days (11 U.S.C. § 521(a)(2)).'
    ],
    mandatoryAttachments: [
      'Form 108 (Statement of Intention regarding collateral retention, reaffirmation, or surrender)'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Schedule D for 3 years post-case closing.',
    nextStepsChecklist: [
      'Verify split between secured portion and unsecured deficiency portion for under-secured loans.',
      'Ensure all secured creditors appear on the Creditor Address Matrix.',
      'Send notice of bankruptcy to mortgage servicer loss mitigation department.'
    ]
  },

  form106ef: {
    formId: 'form106ef',
    officialFormNumber: 'Official Form 106E/F',
    title: 'Schedule E/F: Creditors Who Have Unsecured Claims',
    category: 'SCHEDULES',
    summary: 'Part 1: Priority unsecured debts (DSO child support, recent taxes). Part 2: Nonpriority debts (credit cards, medical bills, personal loans).',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Schedules Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Provide priority tax assessments or child support enforcement records if applicable.'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Ensure all collection agencies and original creditors are listed.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'Fax stamped petition to garnishing payroll departments or collection attorney offices',
      faxPermissibilityRules: 'Mandatory to immediately halt wage garnishments under § 362.'
    },
    statutoryDeadlines: [
      'File within 14 days of petition.',
      'Unscheduled debts may not be discharged if creditor lacks actual notice in time to file proof of claim (11 U.S.C. § 523(a)(3)).'
    ],
    mandatoryAttachments: [
      'Creditor Address Matrix (Must include every single creditor from Schedule E/F)'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Schedule E/F for 3 years post-case closing.',
    nextStepsChecklist: [
      'Verify Domestic Support Obligations (DSO) are flagged as Priority claims under 11 U.S.C. § 507(a)(1)(A).',
      'Check contingent, unliquidated, and disputed checkboxes for contested claims.',
      'Ensure matrix matches all creditor mailing addresses precisely.'
    ]
  },

  form106g: {
    formId: 'form106g',
    officialFormNumber: 'Official Form 106G',
    title: 'Schedule G: Executory Contracts and Unexpired Leases',
    category: 'SCHEDULES',
    summary: 'Discloses residential apartment leases, vehicle leases, cell phone contracts, and ongoing business service agreements.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Schedules Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Provide copy of residential lease agreement to Trustee upon request.'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Include landlord and lessor contact information.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'Fax to landlord / leasing company to halt pending eviction proceedings',
      faxPermissibilityRules: 'Subject to 11 U.S.C. § 362(b)(22) pre-petition judgment rules.'
    },
    statutoryDeadlines: [
      'File within 14 days of petition.',
      'Trustee has 60 days to assume or reject residential leases; deemed rejected if not assumed (11 U.S.C. § 365(d)(1)).'
    ],
    mandatoryAttachments: [
      'Form 108 (Statement of Intention regarding assumption or rejection of unexpired personal property leases)'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Schedule G for 3 years post-case closing.',
    nextStepsChecklist: [
      'Specify intention to ASSUME (continue paying & keep) or REJECT (surrender).',
      'List counterparty name and address on creditor matrix for formal court notice.',
      'Ensure monthly lease payment is correctly reflected on Schedule J expenses.'
    ]
  },

  form106h: {
    formId: 'form106h',
    officialFormNumber: 'Official Form 106H',
    title: 'Schedule H: Your Codebtors',
    category: 'SCHEDULES',
    summary: 'Identifies co-signers, joint obligors, former spouses, and guarantors liable on any of the debtor\'s debts.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Schedules Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'N/A'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Include full mailing addresses of co-signers.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'N/A',
      faxPermissibilityRules: 'Standard schedules transmission.'
    },
    statutoryDeadlines: [
      'File within 14 days of petition.',
      'In Chapter 13, codebtor stay automatically protects co-signers on consumer debts (11 U.S.C. § 1301).'
    ],
    mandatoryAttachments: [
      'Cross-reference Schedule D or E/F claim identifiers.'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Schedule H for 3 years post-case closing.',
    nextStepsChecklist: [
      'Identify whether joint debtor spouse or external third party is the codebtor.',
      'Inform codebtor that Chapter 7 discharge does not extinguish codebtor liability to the creditor.',
      'Add codebtor names and addresses to the Creditor Matrix.'
    ]
  },

  form106i: {
    formId: 'form106i',
    officialFormNumber: 'Official Form 106I',
    title: 'Schedule I: Your Income',
    category: 'SCHEDULES',
    summary: 'Discloses current monthly gross wages, overtime, business income, pension, Social Security, and statutory payroll deductions.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Schedules Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Upload 60 days of pay stubs / employer wage advices to Trustee portal (11 U.S.C. § 521(a)(1)(B)(iv)).'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Ensure payroll deductions match pay stubs exactly.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'N/A',
      faxPermissibilityRules: 'Part of schedules packet.'
    },
    statutoryDeadlines: [
      'File within 14 days of petition.',
      'Pay stubs (60 days prior) must be submitted to Trustee at least 7 days prior to the § 341 meeting (Local Rule 1007-1).'
    ],
    mandatoryAttachments: [
      'Pay Stubs / Payment Advices for 60-day lookback period',
      'Profit & Loss statement if self-employed'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Schedule I for 3 years post-case closing.',
    nextStepsChecklist: [
      'Convert weekly, bi-weekly, or semi-monthly pay periods to true monthly figures (Weekly x 4.333, Bi-weekly x 2.167).',
      'Disclose anticipated income changes within the next 12 months in Line 13.',
      'Reconcile with 6-month historical CMI on Form 122A-1.'
    ]
  },

  form106j: {
    formId: 'form106j',
    officialFormNumber: 'Official Form 106J',
    title: 'Schedule J: Your Expenses',
    category: 'SCHEDULES',
    summary: 'Itemizes ongoing monthly living expenses (rent/mortgage, utilities, food, healthcare, transportation, insurance) for the debtor\'s household.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Schedules Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Provide utility bills, lease, or childcare expense receipts to Trustee if requested.'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Reconcile net monthly income vs. expenses.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'N/A',
      faxPermissibilityRules: 'Part of schedules packet.'
    },
    statutoryDeadlines: [
      'File within 14 days of petition.',
      'Critical for calculating Monthly Net Income (Line 23c = Schedule I Net Income minus Schedule J Total Expenses).'
    ],
    mandatoryAttachments: [
      'Schedule J-2 (If joint debtor maintains a separate household)'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Schedule J for 3 years post-case closing.',
    nextStepsChecklist: [
      'Audit Net Monthly Income (Line 23c): In Chapter 7, positive surplus income > $150-$200/mo can trigger U.S. Trustee motions under § 707(b)(3) for totality of circumstances.',
      'Ensure mortgage or rent expense matches Schedule G / Schedule D.',
      'Include all realistic household dependents and food/clothing allowances.'
    ]
  },

  form106j2: {
    formId: 'form106j2',
    officialFormNumber: 'Official Form 106J-2',
    title: 'Schedule J-2: Expenses for Separate Household of Debtor 2',
    category: 'SCHEDULES',
    summary: 'Used exclusively in joint filings where Debtor 1 and Debtor 2 maintain separate residences/households due to separation or legal division.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Schedules Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Provide Debtor 2 lease agreement.'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Only required if separate household is maintained.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'N/A',
      faxPermissibilityRules: 'Part of schedules packet.'
    },
    statutoryDeadlines: [
      'File within 14 days of petition.'
    ],
    mandatoryAttachments: [
      'Schedule J (Debtor 1 Primary Household)'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Schedule J-2 for 3 years post-case closing.',
    nextStepsChecklist: [
      'Verify separate address for Debtor 2 is disclosed.',
      'Ensure total combined household expenses equal Schedule J + Schedule J-2.'
    ]
  },

  form107: {
    formId: 'form107',
    officialFormNumber: 'Official Form 107',
    title: 'Statement of Financial Affairs for Individuals (SOFA)',
    category: 'FINANCIAL_STATEMENTS',
    summary: 'In-depth historical audit of income over 3 years, recent creditor payments, lawsuits, repossessions, gifts, property transfers, and closed bank accounts.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Statements Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Provide lawsuit pleadings, divorce decrees, and closing statements to Trustee.'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Severe criminal penalties under 18 U.S.C. § 152 for false statements or concealed asset transfers.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'N/A',
      faxPermissibilityRules: 'Part of omnibus filing.'
    },
    statutoryDeadlines: [
      'File within 14 days of petition.',
      'Examines 90-day preference period for non-insider creditors, and 1-year lookback for insider family payments (§ 547(b)).',
      'Examines 2-year lookback for fraudulent transfers (§ 548).'
    ],
    mandatoryAttachments: [
      'Tax Returns for past 2 years'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Form 107 for 3 years post-case closing.',
    nextStepsChecklist: [
      'Reconcile gross income for current YTD, last year, and 2 years ago with federal Form 1040 tax returns.',
      'Disclose any payments to family members or business associates within the past 12 months.',
      'List all pending Colorado state court lawsuits and garnishment proceedings in Part 4.'
    ]
  },

  form108: {
    formId: 'form108',
    officialFormNumber: 'Official Form 108',
    title: 'Statement of Intention for Individuals Filing Under Chapter 7',
    category: 'PETITION_CORE',
    summary: 'Specifies debtor intention regarding secured consumer collateral (Retain & Reaffirm, Retain & Redeem, or Surrender) and unexpired leases.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Form 108 Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Serve copy directly on secured lenders and lessors'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Must be served on all affected creditors on or before filing.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'Transmit to vehicle loan servicer with chosen intention',
      faxPermissibilityRules: 'Mandatory creditor service.'
    },
    statutoryDeadlines: [
      'File within 30 days after petition date or on/before § 341 meeting, whichever is earlier (11 U.S.C. § 521(a)(2)(A)).',
      'Perform intention (execute reaffirmation agreement or surrender) within 30 days after the date first set for § 341 meeting (§ 521(a)(2)(B)).'
    ],
    mandatoryAttachments: [
      'Certificate of Service certifying delivery to all listed secured creditors and lessors.'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Form 108 for 3 years post-case closing.',
    nextStepsChecklist: [
      'Indicate exact intention for vehicle: RETAIN AND REAFFIRM, RETAIN AND REDEEM (§ 722), or SURRENDER.',
      'Mail or email copy to vehicle financing company and mortgage servicer.',
      'Obtain formal Reaffirmation Agreement (Form 2400A) from lender if retaining debt.'
    ]
  },

  form122a1: {
    formId: 'form122a1',
    officialFormNumber: 'Official Form 122A-1',
    title: 'Chapter 7 Statement of Your Current Monthly Income (CMI)',
    category: 'MEANS_TEST',
    summary: 'Calculates the 6-month historical monthly income average and annualizes it against the Colorado statutory median income threshold.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Means Test Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Provide 6-month historical wage records / bank deposits to Trustee.'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Calculates qualification for Chapter 7 under § 707(b).'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'N/A',
      faxPermissibilityRules: 'Part of means test packet.'
    },
    statutoryDeadlines: [
      'File within 14 days of petition.',
      'Determines whether Form 122A-2 Means Test Calculation is required (if annualized CMI exceeds Colorado median).'
    ],
    mandatoryAttachments: [
      '6 full calendar months of pay stubs and revenue documentation prior to filing month',
      'Form 122A-1Supp (if claiming military or non-consumer debt exemption)'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Form 122A-1 for 3 years post-case closing.',
    nextStepsChecklist: [
      'Calculate precise 6 full calendar month lookback period (excluding month of filing).',
      'Compare Annualized CMI against Colorado Median: Family of 1 ($76,450), Family of 2 ($98,200), Family of 3 ($114,800), Family of 4 ($136,500).',
      'If Below Median: Check "Presumption of Abuse does NOT arise" — Form 122A-2 not required!',
      'If Above Median: Proceed to complete Form 122A-2 expense deductions.'
    ]
  },

  form122a2: {
    formId: 'form122a2',
    officialFormNumber: 'Official Form 122A-2',
    title: 'Chapter 7 Means Test Calculation (Deductions & Presumption)',
    category: 'MEANS_TEST',
    summary: 'Applies IRS National and Local Expense Standards, actual secured debt payments, and priority expenses to calculate 60-month disposable income.',
    whereToMail: {
      denverDivision: 'U.S. Bankruptcy Court, 721 19th St, Room 400, Denver, CO 80202',
      coloradoSpringsDivision: 'U.S. Bankruptcy Court, 212 N. Wahsatch Ave., Suite 101, Colorado Springs, CO 80903',
      grandJunctionDivision: 'U.S. Bankruptcy Court, 400 Rood Ave, Room 216, Grand Junction, CO 81501',
      attention: 'Bankruptcy Docketing Section'
    },
    whereToEmail: {
      ecfGatewayUrl: 'CM/ECF Means Test Module',
      proSeEmergencyEmail: 'cob_emergency_filings@cob.uscourts.gov',
      usTrusteeEmail: 'USTP.Region19.CO@usdoj.gov',
      trusteeDocumentPortal: 'Provide proof of IRS standard expense deductions, health insurance, and tax payments.'
    },
    whereToDropOff: {
      denverDropBox: 'Courthouse Clerk Window / 24-hr Dropbox',
      coloradoSpringsDropBox: 'Plaza of the Rockies Dropbox',
      grandJunctionDropBox: 'Wayne Aspinall Federal Building Dropbox',
      hours: 'M-F 8:00 AM - 4:30 PM MDT',
      securityNotes: 'Only required for Above-Median debtors.'
    },
    whereToFax: {
      courtClerkEmergencyFax: '(303) 335-2999',
      usTrusteeFax: '(303) 844-4015',
      creditorEmergencyStayFax: 'N/A',
      faxPermissibilityRules: 'Part of means test packet.'
    },
    statutoryDeadlines: [
      'File within 14 days of petition.',
      'If 60-month disposable income exceeds statutory thresholds ($9,075 - $15,150), Presumption of Abuse arises under 11 U.S.C. § 707(b)(2).'
    ],
    mandatoryAttachments: [
      'Form 122A-1',
      'Documentation of special circumstances under § 707(b)(2)(B) if rebutting presumption'
    ],
    publicDocketStatus: 'PUBLIC_DOCKET',
    wetSignatureRetentionRule: 'Retain signed Form 122A-2 for 3 years post-case closing.',
    nextStepsChecklist: [
      'Apply Colorado IRS Local Transportation, Housing, and Healthcare standard deductions.',
      'Deduct mandatory payroll taxes, union dues, involuntary retirement, and term life insurance.',
      'Deduct average monthly mortgage and vehicle contractual payments due over next 60 months.',
      'If presumption arises: Evaluate conversion to Chapter 13 repayment plan.'
    ]
  }
};

/**
 * Returns document routing guidance for any given form key.
 */
export function getDocumentRoutingInfo(formKey: string): DocumentRoutingInfo {
  const normalized = formKey.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (COLORADO_DOCUMENT_ROUTING_REGISTRY[normalized]) {
    return COLORADO_DOCUMENT_ROUTING_REGISTRY[normalized];
  }
  // Fallback to Form 101 core
  return COLORADO_DOCUMENT_ROUTING_REGISTRY['form101'];
}

/**
 * Generates an official, printable "Next-Steps & Filing Routing Guide Slip" HTML document
 */
export function renderPrintableRoutingSlipHtml(formKey: string, caseData?: any): string {
  const info = getDocumentRoutingInfo(formKey);
  const debtorName = caseData?.debtor_1?.first_name?.value 
    ? `${caseData.debtor_1.first_name.value} ${caseData.debtor_1.last_name?.value || ''}` 
    : 'Jane Marie Doe';
  const caseNumber = caseData?.case_id || '26-10482-MER';
  const chapter = caseData?.chapter || '7';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <title>Official Filing & Routing Guide — ${info.officialFormNumber}</title>
      <style>
        @media print {
          body { margin: 15mm; font-size: 11pt; color: #000; background: #fff; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          color: #1e293b;
          max-width: 900px;
          margin: 30px auto;
          padding: 20px;
          background: #ffffff;
        }
        .header {
          border-bottom: 3px double #0f172a;
          padding-bottom: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .court-title {
          font-size: 16pt;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .court-sub {
          font-size: 10pt;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
        }
        .tag-pill {
          background: #0284c7;
          color: #fff;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 8pt;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .tag-pill.confidential {
          background: #dc2626;
        }
        .case-bar {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 10px 14px;
          border-radius: 6px;
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          font-size: 9pt;
        }
        .case-bar strong { color: #0f172a; display: block; font-size: 10pt; }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .section-card {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 14px;
          background: #fafafa;
        }
        .section-card h3 {
          margin: 0 0 8px 0;
          font-size: 11pt;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 6px;
        }
        .address-box {
          font-size: 9pt;
          margin-top: 6px;
          line-height: 1.4;
        }
        .address-box strong { color: #334155; }
        .checklist {
          margin: 0;
          padding-left: 20px;
          font-size: 9.5pt;
        }
        .checklist li { margin-bottom: 6px; }
        .deadline-badge {
          color: #b91c1c;
          font-weight: 700;
        }
        .btn-print {
          background: #0284c7;
          color: #fff;
          border: none;
          padding: 10px 20px;
          font-weight: 700;
          font-size: 10pt;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 20px;
        }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #cbd5e1;
          padding-top: 10px;
          font-size: 8pt;
          color: #64748b;
          display: flex;
          justify-content: space-between;
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <button class="btn-print" onclick="window.print()">🖨️ Print This Filing & Routing Guide Slip</button>
        <span style="font-size:9pt; color:#64748b;">Ready for attorney / pro-se transmission</span>
      </div>

      <div class="header">
        <div>
          <div class="court-sub">UNITED STATES BANKRUPTCY COURT • DISTRICT OF COLORADO</div>
          <div class="court-title">Document Filing, Next-Steps & Routing Instruction Slip</div>
          <div style="font-size:10.5pt; font-weight:600; color:#0369a1; margin-top:4px;">${info.officialFormNumber}: ${info.title}</div>
        </div>
        <div>
          <span class="tag-pill ${info.publicDocketStatus === 'SEALED_NON_PUBLIC' ? 'confidential' : ''}">
            ${info.publicDocketStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div class="case-bar">
        <div><span>Debtor(s):</span><strong>${debtorName}</strong></div>
        <div><span>Assigned Case No:</span><strong>${caseNumber}</strong></div>
        <div><span>Chapter:</span><strong>Chapter ${chapter}</strong></div>
        <div><span>Jurisdiction:</span><strong>District of Colorado</strong></div>
      </div>

      <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px 14px; border-radius:6px; margin-bottom:16px; font-size:9.5pt; color:#166534;">
        <strong>Document Purpose:</strong> ${info.summary}
      </div>

      <div class="grid-2">
        <!-- Where to Mail -->
        <div class="section-card">
          <h3>📬 1. Where to Mail Physical Copies</h3>
          <div class="address-box">
            <strong>Denver Division (Main Headquarters):</strong><br/>
            ${info.whereToMail.denverDivision}<br/>
            <em>Attn: ${info.whereToMail.attention}</em>
          </div>
          <div class="address-box" style="margin-top:8px;">
            <strong>Colorado Springs Division:</strong><br/>
            ${info.whereToMail.coloradoSpringsDivision}
          </div>
          <div class="address-box" style="margin-top:8px;">
            <strong>Grand Junction Division:</strong><br/>
            ${info.whereToMail.grandJunctionDivision}
          </div>
        </div>

        <!-- Where to Drop Off -->
        <div class="section-card">
          <h3>🏢 2. Physical Intake Windows & 24/7 Drop Boxes</h3>
          <div class="address-box">
            <strong>Denver Courthouse Drop Box:</strong><br/>
            ${info.whereToDropOff.denverDropBox}
          </div>
          <div class="address-box" style="margin-top:8px;">
            <strong>Intake Hours:</strong> ${info.whereToDropOff.hours}
          </div>
          <div class="address-box" style="margin-top:8px;">
            <strong>Security & ID Requirements:</strong><br/>
            ${info.whereToDropOff.securityNotes}
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Where to Email / ECF -->
        <div class="section-card">
          <h3>🌐 3. Electronic Case Filing (ECF) & Email Portals</h3>
          <div class="address-box">
            <strong>Attorney CM/ECF Gateway:</strong><br/>
            <code style="font-size:8.5pt; color:#0284c7;">${info.whereToEmail.ecfGatewayUrl}</code>
          </div>
          <div class="address-box" style="margin-top:8px;">
            <strong>Pro Se Emergency Filing Email:</strong><br/>
            <a href="mailto:${info.whereToEmail.proSeEmergencyEmail}" style="color:#0284c7;">${info.whereToEmail.proSeEmergencyEmail}</a>
          </div>
          <div class="address-box" style="margin-top:8px;">
            <strong>U.S. Trustee Region 19 Portal:</strong><br/>
            <a href="mailto:${info.whereToEmail.usTrusteeEmail}" style="color:#0284c7;">${info.whereToEmail.usTrusteeEmail}</a>
          </div>
        </div>

        <!-- Where to Fax -->
        <div class="section-card">
          <h3>📠 4. Official Fax Numbers & Emergency Lines</h3>
          <div class="address-box">
            <strong>Court Clerk Emergency Stay Fax:</strong><br/>
            <strong>${info.whereToFax.courtClerkEmergencyFax}</strong> (Pre-approval required)
          </div>
          <div class="address-box" style="margin-top:8px;">
            <strong>U.S. Trustee Fax:</strong> ${info.whereToFax.usTrusteeFax}
          </div>
          <div class="address-box" style="margin-top:8px;">
            <strong>Creditor Emergency Notice Rule:</strong><br/>
            ${info.whereToFax.creditorEmergencyStayFax}
          </div>
        </div>
      </div>

      <!-- Statutory Deadlines & Next Steps Checklist -->
      <div class="section-card" style="margin-bottom:16px;">
        <h3>⏰ 5. Statutory Deadlines & Mandatory Action Items</h3>
        <ul class="checklist">
          ${info.statutoryDeadlines.map(d => `<li class="deadline-badge">⚠️ ${d}</li>`).join('')}
          ${info.nextStepsChecklist.map(s => `<li><input type="checkbox"/> ${s}</li>`).join('')}
        </ul>
      </div>

      <!-- Mandatory Accompanying Documents & Retention Rules -->
      <div class="grid-2">
        <div class="section-card">
          <h3>📎 Accompanying Documents Required</h3>
          <ul style="margin:0; padding-left:18px; font-size:9pt;">
            ${info.mandatoryAttachments.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h3>⚖️ L.B.R. 5005-4 Wet Signature Rule</h3>
          <p style="margin:0; font-size:8.5pt; color:#475569;">
            ${info.wetSignatureRetentionRule}
          </p>
        </div>
      </div>

      <div class="footer">
        <span>VoxelLex.AI Colorado — Attorney-Supervised Petition Preparation Platform</span>
        <span>Generated: ${new Date().toLocaleString()} (MDT)</span>
        <span>USBC District of Colorado Certified Routing</span>
      </div>
    </body>
    </html>
  `;
}
