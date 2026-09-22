import { describe, expect, it } from 'bun:test';
import { createSampleMasterCaseData } from './helpers/sample-case';
import {
  DEFAULT_SENDER_VESSELS,
  buildFormEmailTransmissionPath,
  buildGmailComposeUrl,
  buildStandardMailtoUrl
} from '../lib/engine/routing/email-transmission-dispatcher';

const FORMS = ['form101', 'form121', 'form106ab', 'form106c', 'form106d', 'form106ef', 'form106i', 'form106j', 'form122a1'];

describe('email dispatcher cannot reach a real court or government mailbox', () => {
  it('every recipient is on the reserved .invalid TLD (sender BCC aside)', () => {
    const data = createSampleMasterCaseData();
    for (const vessel of Object.values(DEFAULT_SENDER_VESSELS)) {
      for (const formId of FORMS) {
        const path = buildFormEmailTransmissionPath(formId, data, vessel);
        for (const addr of [path.destinationEmail, path.secondaryEmail, ...path.ccEmails]) {
          expect(addr.endsWith('.invalid')).toBe(true);
        }
        const links = buildGmailComposeUrl(path) + buildStandardMailtoUrl(path);
        expect(links).not.toMatch(/uscourts\.gov|usdoj\.gov/i);
        expect(path.certifiedSubject).toContain('NOT A COURT FILING');
        expect(path.documentHash).not.toMatch(/^SHA256:/);
      }
    }
  });
});
