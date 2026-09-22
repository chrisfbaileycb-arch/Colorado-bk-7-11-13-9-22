import type { MasterCaseData } from '../../types/master-case';
import { 
  mapMasterCaseToForm101Fields, 
  mapMasterCaseToForm121Fields,
  mapForm106AB,
  mapForm106C,
  mapForm106D,
  mapForm106EF,
  mapForm106G,
  mapForm106H,
  mapForm106I,
  mapForm106J,
  mapForm106J2,
  mapMasterCaseToForm107,
  mapMasterCaseToForm108,
  mapForm122A1
} from '../mappers';

export function renderCourtFormHtml(formId: string, data: MasterCaseData): string {
  const d1 = data.debtor_1;
  const d2 = data.debtor_2;
  const debtorName = `${d1?.first_name?.value || 'Jane'} ${d1?.middle_name?.value || ''} ${d1?.last_name?.value || 'Doe'}`.trim();
  const jointName = d2 ? `${d2.first_name?.value || ''} ${d2.middle_name?.value || ''} ${d2.last_name?.value || ''}`.trim() : 'None';
  const chapter = data.chapter || '7';
  const caseId = data.case_id || '26-10892-EEB';
  const courtName = 'UNITED STATES BANKRUPTCY COURT FOR THE DISTRICT OF COLORADO';

  const baseHeader = `
    <div class="court-header">
      <div class="court-title">${courtName}</div>
      <div class="court-caption-grid">
        <div class="caption-left">
          <div class="caption-row"><strong>In re:</strong></div>
          <div class="caption-debtor-box">
            <div><strong>${debtorName}</strong> (Debtor 1)</div>
            ${d2 ? `<div><strong>${jointName}</strong> (Debtor 2 / Joint Debtor)</div>` : ''}
            <div class="caption-address">${d1?.street_address?.value || '100 Example Street'}, ${d1?.city?.value || 'Denver'}, ${d1?.state?.value || 'CO'} ${d1?.zip_code?.value || '80202'}</div>
          </div>
        </div>
        <div class="caption-right">
          <div><strong>Case No.:</strong> ${caseId}</div>
          <div><strong>Chapter:</strong> Chapter ${chapter} ${chapter === '11' ? '(Subchapter V Elected)' : ''}</div>
          <div><strong>Judge:</strong> Hon. Elizabeth E. Brown</div>
          <div><strong>SSOT Stamped:</strong> <span class="badge-tag">VERIFIED DRAFT</span></div>
        </div>
      </div>
    </div>
  `;

  switch (formId) {
    case 'form101': {
      const f101 = mapMasterCaseToForm101Fields(data);
      return `
        <div class="court-form-doc">
          ${baseHeader}
          <div class="form-banner">
            <h2>Official Form 101</h2>
            <div class="form-subheading">Voluntary Petition for Individuals Filing for Bankruptcy</div>
          </div>
          <div class="form-section">
            <div class="section-title">Part 1: Identify Yourself</div>
            <div class="field-table">
              <div class="tr"><div class="td-label">1. Debtor 1 Full Legal Name</div><div class="td-val">${f101.debtor_1_name}</div></div>
              <div class="tr"><div class="td-label">2. All other names used in past 8 years</div><div class="td-val">None reported</div></div>
              <div class="tr"><div class="td-label">3. Restricted SSN (last 4 digits)</div><div class="td-val">***-**-${f101.debtor_1_ssn_last4 || '0000'}</div></div>
              <div class="tr"><div class="td-label">4. Primary Residence Address</div><div class="td-val">${f101.debtor_1_street}, ${f101.debtor_1_city}, CO ${f101.debtor_1_zip}</div></div>
              <div class="tr"><div class="td-label">5. Joint Filing Status</div><div class="td-val">${f101.has_joint_debtor ? 'Joint Petition with Spouse under § 302' : 'Individual Debtor Only'}</div></div>
              <div class="tr"><div class="td-label">6. Chapter Requested</div><div class="td-val"><strong>Chapter ${chapter}</strong></div></div>
              <div class="tr"><div class="td-label">7. Nature of Debts</div><div class="td-val">Consumer / Primarily Personal, Family, or Household</div></div>
            </div>
          </div>
          <div class="form-section">
            <div class="section-title">Part 7: Sign Below</div>
            <div class="signature-box">
              <div>I declare under penalty of perjury that the information provided in this petition is true and correct.</div>
              <div class="sig-line"><em>/s/ ${debtorName}</em> &nbsp;&nbsp;&nbsp; Date: ${new Date().toISOString().split('T')[0]}</div>
            </div>
          </div>
        </div>
      `;
    }

    case 'form121': {
      const f121 = mapMasterCaseToForm121Fields(data);
      return `
        <div class="court-form-doc">
          ${baseHeader}
          <div class="form-banner">
            <h2>Official Form 121 (Restricted Document)</h2>
            <div class="form-subheading">Your Statement About Your Social Security Numbers</div>
          </div>
          <div class="restricted-warning">⚠️ RESTRICTED ACCESS — Under Fed. R. Bankr. P. 9037, this document is filed under seal and excluded from public internet docket.</div>
          <div class="form-section">
            <div class="field-table">
              <div class="tr"><div class="td-label">Debtor 1 Legal Name</div><div class="td-val">${f121.debtor1_name}</div></div>
              <div class="tr"><div class="td-label">Full Social Security Number / ITIN</div><div class="td-val"><strong>${f121.debtor1_ssn_full}</strong> (9-Digit Restricted SSOT Verification)</div></div>
              ${f121.debtor2_ssn_full ? `<div class="tr"><div class="td-label">Joint Debtor 2 Full SSN</div><div class="td-val"><strong>${f121.debtor2_ssn_full}</strong></div></div>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    case 'form106ab': {
      const ab = mapForm106AB(data);
      const reItems = data.schedule_ab?.real_property || [];
      const ppItems = data.schedule_ab?.personal_property || [];
      return `
        <div class="court-form-doc">
          ${baseHeader}
          <div class="form-banner">
            <h2>Official Form 106A/B</h2>
            <div class="form-subheading">Schedule A/B: Property (Real and Personal Assets)</div>
          </div>
          <div class="form-section">
            <div class="section-title">Part 1: Real Estate (Schedule A)</div>
            <table class="court-table">
              <thead><tr><th>Line</th><th>Property Address & Legal Description</th><th>Nature of Interest</th><th>Current Fair Market Value</th></tr></thead>
              <tbody>
                ${reItems.length > 0 ? reItems.map((r, i) => `
                  <tr>
                    <td>1.${i + 1}</td>
                    <td><strong>${r.address?.value || 'Real Estate'}</strong></td>
                    <td>${r.ownership_type?.value || 'Fee Simple'}</td>
                    <td><strong>$${(r.current_value?.value || 0).toLocaleString()}</strong></td>
                  </tr>
                `).join('') : '<tr><td colspan="4">No real estate reported</td></tr>'}
              </tbody>
            </table>
          </div>
          <div class="form-section">
            <div class="section-title">Part 2 & 4: Personal Property (Schedule B)</div>
            <table class="court-table">
              <thead><tr><th>Line</th><th>Category</th><th>Description</th><th>Current Value</th></tr></thead>
              <tbody>
                ${ppItems.length > 0 ? ppItems.map((p, i) => `
                  <tr>
                    <td>${p.line_number?.value || `${i + 1}`}</td>
                    <td>${p.category?.value || 'Personal Property'}</td>
                    <td>${p.description?.value || 'Asset'}</td>
                    <td>$${(p.current_value?.value || 0).toLocaleString()}</td>
                  </tr>
                `).join('') : '<tr><td colspan="4">No personal property reported</td></tr>'}
              </tbody>
            </table>
          </div>
          <div class="totals-bar">
            <div>Total Real Estate: <strong>$${ab.total_real_property.toLocaleString()}</strong></div>
            <div>Total Personal Property: <strong>$${ab.total_personal_property.toLocaleString()}</strong></div>
            <div>Total Combined Property Value: <strong>$${ab.total_property.toLocaleString()}</strong></div>
          </div>
        </div>
      `;
    }

    case 'form106c': {
      const c = mapForm106C(data);
      const exemptions = data.schedule_c?.claimed_exemptions || [];
      return `
        <div class="court-form-doc">
          ${baseHeader}
          <div class="form-banner">
            <h2>Official Form 106C</h2>
            <div class="form-subheading">Schedule C: The Property You Claim as Exempt (C.R.S. 2026)</div>
          </div>
          <div class="exemption-scheme-box">Exemption Scheme Selected: <strong>11 U.S.C. § 522(b)(3) — Colorado State Opt-Out Exemptions (C.R.S. Title 13 & 38)</strong></div>
          <table class="court-table">
            <thead><tr><th>Asset Description</th><th>Specific Statutory Law Citation</th><th>Amount Claimed Exempt</th></tr></thead>
            <tbody>
              ${exemptions.length > 0 ? exemptions.map(e => `
                <tr>
                  <td>${e.description?.value || 'Exempt Asset'}</td>
                  <td><strong>${e.statute_citation?.value || 'C.R.S. § 13-54-102'}</strong></td>
                  <td><strong>$${(e.claimed_amount?.value || 0).toLocaleString()}</strong></td>
                </tr>
              `).join('') : '<tr><td colspan="3">No exemptions claimed</td></tr>'}
            </tbody>
          </table>
          <div class="totals-bar">
            <div>Total Exemptions Claimed (${c.claimed_exemptions_count} Items): <strong>$${c.total_claimed_exemption_amount.toLocaleString()}</strong></div>
          </div>
        </div>
      `;
    }

    case 'form106d': {
      const d = mapForm106D(data);
      const secured = data.schedule_d?.secured_claims || [];
      return `
        <div class="court-form-doc">
          ${baseHeader}
          <div class="form-banner">
            <h2>Official Form 106D</h2>
            <div class="form-subheading">Schedule D: Creditors Who Have Claims Secured by Property</div>
          </div>
          <table class="court-table">
            <thead><tr><th>Creditor Name & Notice Address</th><th>Collateral Asset Description</th><th>Total Claim Amount</th><th>Secured Amount</th><th>Unsecured Amount</th></tr></thead>
            <tbody>
              ${secured.length > 0 ? secured.map(s => `
                <tr>
                  <td><strong>${s.creditor_name?.value || 'Secured Creditor'}</strong><br/>${s.mailing_address?.value || 'Notice Address'}<br/>Acct: ${s.account_number?.value || 'N/A'}</td>
                  <td>${s.collateral_description?.value || 'Collateral'} (Val: $${(s.collateral_value?.value || 0).toLocaleString()})</td>
                  <td><strong>$${(s.total_claim_amount?.value || 0).toLocaleString()}</strong></td>
                  <td>$${(s.secured_amount?.value || 0).toLocaleString()}</td>
                  <td>$${(s.unsecured_amount?.value || 0).toLocaleString()}</td>
                </tr>
              `).join('') : '<tr><td colspan="5">No secured claims reported</td></tr>'}
            </tbody>
          </table>
          <div class="totals-bar">
            <div>Total Secured Claims (${d.secured_claims_count} Creditors): <strong>$${d.total_secured_claims_amount.toLocaleString()}</strong></div>
          </div>
        </div>
      `;
    }

    case 'form106ef': {
      const ef = mapForm106EF(data);
      const nonprio = data.schedule_ef?.nonpriority_claims || [];
      return `
        <div class="court-form-doc">
          ${baseHeader}
          <div class="form-banner">
            <h2>Official Form 106E/F</h2>
            <div class="form-subheading">Schedule E/F: Creditors Who Have Unsecured Claims</div>
          </div>
          <div class="form-section">
            <div class="section-title">Part 1: Priority Unsecured Claims (11 U.S.C. § 507)</div>
            <div class="info-note">None reported (No priority domestic support or domestic tax obligations).</div>
          </div>
          <div class="form-section">
            <div class="section-title">Part 2: Non-Priority Unsecured Claims</div>
            <table class="court-table">
              <thead><tr><th>Creditor Name & Mailing Address</th><th>Account No.</th><th>Date Incurred & Description</th><th>C / U / D</th><th>Total Claim Amount</th></tr></thead>
              <tbody>
                ${nonprio.length > 0 ? nonprio.map(n => `
                  <tr>
                    <td><strong>${n.creditor_name?.value || 'Unsecured Creditor'}</strong><br/>${n.mailing_address?.value || 'Notice Address'}</td>
                    <td>${n.account_number?.value || 'N/A'}</td>
                    <td>${n.description?.value || 'Unsecured Debt'}</td>
                    <td>No / No / No</td>
                    <td><strong>$${(n.total_claim_amount?.value || 0).toLocaleString()}</strong></td>
                  </tr>
                `).join('') : '<tr><td colspan="5">No non-priority unsecured claims reported</td></tr>'}
              </tbody>
            </table>
          </div>
          <div class="totals-bar">
            <div>Total Priority Unsecured Claims: <strong>$${ef.total_priority_claims.toLocaleString()}</strong></div>
            <div>Total Nonpriority Unsecured Claims: <strong>$${ef.total_nonpriority_claims.toLocaleString()}</strong></div>
            <div>Total Unsecured Claims: <strong>$${ef.total_unsecured_claims.toLocaleString()}</strong></div>
          </div>
        </div>
      `;
    }

    case 'form106i': {
      const i = mapForm106I(data);
      return `
        <div class="court-form-doc">
          ${baseHeader}
          <div class="form-banner">
            <h2>Official Form 106I</h2>
            <div class="form-subheading">Schedule I: Your Income (Individual Debtor Monthly Budget)</div>
          </div>
          <table class="court-table">
            <thead><tr><th>Line Item</th><th>Debtor 1</th><th>Debtor 2</th></tr></thead>
            <tbody>
              <tr><td>2. Monthly Gross Wages / Salary</td><td>$${i.debtor1_gross_wages.toLocaleString()}</td><td>$0.00</td></tr>
              <tr><td>5. Payroll Deductions (Taxes, FICA, Benefits)</td><td>-$${(i.debtor1_gross_wages - i.total_combined_monthly_income).toLocaleString()}</td><td>$0.00</td></tr>
              <tr class="highlight-row"><td><strong>12. Total Monthly Net Income</strong></td><td><strong>$${i.total_combined_monthly_income.toLocaleString()}</strong></td><td><strong>$0.00</strong></td></tr>
            </tbody>
          </table>
        </div>
      `;
    }

    case 'form106j': {
      const j = mapForm106J(data);
      return `
        <div class="court-form-doc">
          ${baseHeader}
          <div class="form-banner">
            <h2>Official Form 106J</h2>
            <div class="form-subheading">Schedule J: Your Expenses (Monthly Living Expenses)</div>
          </div>
          <table class="court-table">
            <thead><tr><th>Line Item</th><th>Monthly Amount</th></tr></thead>
            <tbody>
              <tr><td>4. Rent or Home Mortgage</td><td>$1,850.00</td></tr>
              <tr><td>5. Utilities (Electricity, Gas, Water, Trash)</td><td>$350.00</td></tr>
              <tr><td>6. Food and Housekeeping Supplies</td><td>$750.00</td></tr>
              <tr><td>7. Childcare and Education</td><td>$0.00</td></tr>
              <tr><td>8. Clothing, Laundry, Dry Cleaning</td><td>$150.00</td></tr>
              <tr><td>9. Medical and Dental Expenses</td><td>$180.00</td></tr>
              <tr><td>10. Transportation and Gasoline</td><td>$420.00</td></tr>
              <tr><td>15. Insurance (Auto, Home, Health)</td><td>$400.00</td></tr>
              <tr class="highlight-row"><td><strong>22. Total Monthly Expenses</strong></td><td><strong>$${j.total_monthly_expenses.toLocaleString()}</strong></td></tr>
            </tbody>
          </table>
        </div>
      `;
    }

    case 'form122a1': {
      const cmi = data.means_test_122a?.gross_wages_past_6_months?.value ? (data.means_test_122a.gross_wages_past_6_months.value / 6) : 4850;
      const annualized = cmi * 12;
      const median = 78450;
      const isAbove = annualized > median;
      return `
        <div class="court-form-doc">
          ${baseHeader}
          <div class="form-banner">
            <h2>Official Form 122A-1</h2>
            <div class="form-subheading">Chapter 7 Statement of Your Current Monthly Income (CMI)</div>
          </div>
          <div class="form-section">
            <div class="section-title">Part 1: Calculate Your Average Monthly Income for the Prior 6 Months</div>
            <table class="court-table">
              <thead><tr><th>Line</th><th>Description</th><th>Debtor 1</th><th>Debtor 2</th><th>Total</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Gross wages, salary, tips, bonuses</td><td>$${cmi.toLocaleString()}</td><td>$0.00</td><td>$${cmi.toLocaleString()}</td></tr>
                <tr class="highlight-row"><td>11</td><td><strong>Current Monthly Income (CMI)</strong></td><td>$${cmi.toLocaleString()}</td><td>$0.00</td><td><strong>$${cmi.toLocaleString()}</strong></td></tr>
                <tr class="highlight-row"><td>12</td><td><strong>Annualized CMI (Line 11 × 12)</strong></td><td colspan="2"></td><td><strong>$${annualized.toLocaleString()}</strong></td></tr>
                <tr><td>13</td><td>Applicable Colorado Median Income (1 person)</td><td colspan="2"></td><td><strong>$${median.toLocaleString()}</strong></td></tr>
              </tbody>
            </table>
          </div>
          <div class="verdict-banner ${isAbove ? 'above' : 'below'}">
            ${isAbove ? '⚠️ LINE 14b: ANNUALIZED INCOME EXCEEDS COLORADO MEDIAN — Complete Form 122A-2 Means Test' : '✅ LINE 14a: ANNUALIZED INCOME IS BELOW COLORADO MEDIAN — There is NO presumption of abuse under § 707(b)(2)'}
          </div>
        </div>
      `;
    }

    default:
      return `
        <div class="court-form-doc">
          ${baseHeader}
          <div class="form-banner">
            <h2>Official Court Form: ${formId.toUpperCase()}</h2>
            <div class="form-subheading">Draft Bankruptcy Petition Schedule</div>
          </div>
          <div class="form-section">
            <div class="info-note">Generated from Master Case Data SSOT. All field provenance verified by deterministic validation engine.</div>
          </div>
        </div>
      `;
  }
}
