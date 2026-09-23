/**
 * License / terms acknowledgment shown to each user on first use of each terms version.
 *
 * TERMS_SECTIONS is a PLACEHOLDER outline, not legal text. Replace it with the license agreement
 * written by the firm's contracts attorney, and bump TERMS_VERSION whenever the text changes so
 * every user is asked to accept the new version.
 */

export const TERMS_VERSION = '0.1-placeholder';
export const TERMS_IS_PLACEHOLDER = true;

export const TERMS_SECTIONS: Array<{ heading: string; body: string }> = [
  { heading: 'Placeholder', body: 'This is an outline only. The binding license agreement will be supplied by counsel and will replace this text.' },
  { heading: 'Preparation tool, not legal advice', body: 'The software prepares drafts. It does not provide legal advice to the firm or its clients.' },
  { heading: 'Attorney responsibility', body: 'The licensed firm and its supervising attorney are responsible for reviewing and approving every filing. Output is a draft until an attorney signs it.' },
  { heading: 'Figures and forms', body: 'Statutory amounts, median income figures and form editions are current only as of the dates shown in the app and must be verified by the firm.' },
  { heading: 'Authorized users', body: "Use is limited to the firm's staff under attorney supervision. No resale, sublicensing or client-facing use." },
  { heading: 'Data', body: 'Case data is handled as described in the data-handling policy. Use synthetic data until the firm approves real-data use.' }
];

export interface TermsAcceptance {
  version: string;
  acceptedAt: string;
  typedName: string;
  /** Cloudflare Access-verified email, when available. */
  verifiedEmail: string | null;
}

export function needsTermsAcceptance(record: TermsAcceptance | null | undefined, version: string = TERMS_VERSION): boolean {
  return !record || record.version !== version || !record.typedName?.trim();
}

export function buildTermsAcceptance(typedName: string, verifiedEmail: string | null, now: Date = new Date()): TermsAcceptance {
  const name = typedName.trim();
  if (!name) throw new Error('A typed name is required to accept the terms.');
  return { version: TERMS_VERSION, acceptedAt: now.toISOString(), typedName: name, verifiedEmail };
}

/** Key is per identity so two people sharing a browser each accept for themselves. */
export function termsStorageKey(verifiedEmail: string | null): string {
  return `terms-acceptance:${verifiedEmail ?? 'local'}`;
}
