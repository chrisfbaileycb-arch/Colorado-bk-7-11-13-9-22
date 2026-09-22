# Build Status (`STATUS.md`)

> **Corrected 2026-09-22.** An earlier version of this file marked every phase **COMPLETE**, including a "Vector PDF Stamper" and "OCR & Document Extraction" that did not exist. This table reflects what the code actually does. It is not a legal, security, or production-readiness certification; release gates are in [docs/release-checklist.md](docs/release-checklist.md).

Legend: **Working** = implemented and covered by tests · **Partial** = implemented with named gaps · **Simulated** = UI only, no real effect · **Not built**

| Phase | Area | Status | Notes |
|---|---|:---:|---|
| 1 | Data model (`MasterCaseData`, `FieldWrapper`), forms manifest | **Working** | Intake → draft sync fixed (`DualStateManager.syncFromIntake`). |
| 2 | Form 101 / 121 mapping and preview | **Working** | Mapper/renderer key mismatch fixed; covered by `tests/forms-output.test.ts`. |
| 2 | PDF output | **Partial** | Real PDFs via `pdf-lib`, but they are watermarked data sheets. Official court templates are not bundled; nothing is "stamped" onto an official form. |
| 3 | Schedules A/B–H mapping | **Partial** | Totals and item lists render. No continuation/overflow engine exists. |
| 4 | Schedules I, J, J-2 and net cash flow | **Working** | Schedule J now reads the keys the intake UI writes. |
| 5 | Form 107 (SOFA), Form 108 (Intention) | **Not built** | Mappers pass raw data through; PDF generator says "not implemented". |
| 6 | Form 122A-1 CMI | **Partial** | CMI math is tested. The six monthly income inputs are **not present in the UI**, so the in-app figure is always the default until an input step is added. Median table is unverified. |
| 6 | Form 122A-2 means test | **Not built** | |
| 7 | Document extraction | **Partial** | Structured-JSON field mapping only. **No OCR**, no AI. Non-JSON input yields no data. Upload pickers are disabled placeholders. |
| 8 | Attorney review and signoff | **Partial** | Field overrides and hard-audit gate work. Signoff is recorded in the browser only; bar number gets a **format check**, not a registry lookup. |
| — | CM/ECF filing | **Simulated** | Labeled walkthrough. No PACER/CM/ECF/Pay.gov connection; no case number, judge or court notice. |
| — | Email outbox | **Simulated** | Drafts compose links to placeholder `.invalid` addresses only. Nothing is attached or sent automatically. |
| — | Copilot / "walkthrough" | **Working (rule-based)** | Keyword matching with pre-written answers. No AI model, no network calls. |
| — | Colorado exemption caps | **Partial** | One pack-driven helper (`getColoradoExemptionCap`). All figures and joint multipliers are **UNVERIFIED** pending Colorado attorney review. |

Test baseline at this revision: `bun test` → 29 tests across 8 files, all passing; `tsc --noEmit` clean; `vite build` succeeds.
