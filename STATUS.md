# Build Status (`STATUS.md`)

> **Corrected 2026-09-22.** An earlier version of this file marked every phase **COMPLETE**, including a "Vector PDF Stamper" and "OCR & Document Extraction" that did not exist. This table reflects what the code actually does. It is not a legal, security, or production-readiness certification; release gates are in [docs/release-checklist.md](docs/release-checklist.md).

Legend: **Working** = implemented and covered by tests · **Partial** = implemented with named gaps · **Simulated** = UI only, no real effect · **Not built**

| Phase | Area | Status | Notes |
|---|---|:---:|---|
| 1 | Data model (`MasterCaseData`, `FieldWrapper`), forms manifest | **Working** | Intake → draft sync fixed (`DualStateManager.syncFromIntake`). |
| 2 | Form 101 / 121 mapping and preview | **Working** | Mapper/renderer key mismatch fixed; covered by `tests/forms-output.test.ts`. |
| 2 | PDF output | **Partial** | Watermarked data-sheet PDFs work for every mapped form. An official-form filler (`official-form-filler.ts`) with edition-drift detection is built and tested, but no official template is bundled and no field map is built yet (uscourts.gov was unreachable from the build environment). See `public/forms/official/README.md`. |
| 3 | Schedules A/B–H mapping | **Partial** | Totals and item lists render. No continuation/overflow engine exists. |
| 4 | Schedules I, J, J-2 and net cash flow | **Working** | Steps 10–12 previously read input ids that did not exist, so typed values were ignored; now wired, with live totals. |
| 5 | Form 107 (SOFA), Form 108 (Intention) | **Not built** | Mappers pass raw data through; PDF generator says "not implemented". |
| 6 | Form 122A-1 CMI | **Working** | Six-month inputs in Step 10 with a live result from the tested CMI engine. Median table is unverified pending counsel sign-off. |
| 6 | Form 122A-2 means test | **Not built** | |
| 7 | Document extraction | **Partial** | Structured-JSON field mapping only. **No OCR**, no AI. Non-JSON input yields no data. Upload pickers are disabled placeholders. |
| 8 | Attorney review and signoff | **Partial** | Field overrides and hard-audit gate work. Signoff records the Cloudflare Access–verified email when deployed behind Access; the registration number still gets a **format check** only. Records live in the browser until server storage exists. |
| — | License terms acknowledgment | **Working** | Versioned first-use acceptance per identity. Text is a **placeholder** until counsel supplies the license agreement. |
| — | Cloudflare deployment | **Ready to deploy** | Access JWT verification (tested), fail-closed middleware, `/api/whoami`, security headers, `wrangler.toml`, marketing site. Not yet deployed; see `docs/deploy-cloudflare.md`. |
| — | CM/ECF filing | **Simulated** | Labeled walkthrough. No PACER/CM/ECF/Pay.gov connection; no case number, judge or court notice. |
| — | Email outbox | **Simulated** | Drafts compose links to placeholder `.invalid` addresses only. Nothing is attached or sent automatically. |
| — | Copilot / "walkthrough" | **Working (rule-based)** | Keyword matching with pre-written answers. No AI model, no network calls. |
| — | Colorado exemption caps | **Partial** | One pack-driven helper (`getColoradoExemptionCap`). All figures and joint multipliers are **UNVERIFIED**; the banner reads the status and updates when counsel's sign-off is recorded (`docs/recording-counsel-signoff.md`). |

Test baseline at this revision: `bun test` → 47 tests across 11 files, all passing; `tsc --noEmit` clean; `vite build` succeeds.
