# VoxelLex.AI Colorado

VoxelLex.AI Colorado is an attorney-supervised Colorado Chapter 7, Chapter 11 (Subchapter V), and Chapter 13 petition-preparation platform. It organizes case information into a single source of truth, tracks field-level provenance, performs deterministic review checks, maps structured data to bankruptcy forms, and generates draft PDF packets for attorney review.

> **Important:** This project is not a law firm, filing service, substitute for counsel, or source of legal advice. Chapter 7 is the implemented prototype workflow. Chapter 11 and Chapter 13 are architectural plans only.

## Live demonstration

[Open the AppDeploy demonstration](https://lexpetition-ai-engine-8prkk7.v2.appdeploy.ai/)

The public deployment is for synthetic demonstration data only. Its acknowledgment screen is not authentication and the deployment must not receive real client information.

## Current capabilities

- Seventeen-step adaptive Chapter 7 intake interface
- Single-source-of-truth `MasterCaseData` model
- Field-level source, confidence, status, notes, and destination metadata
- Schedules A/B through J and J-2 mapping
- Forms 101, 107, 108, 121, 122A-1, and 122A-2 mapping
- Colorado jurisdiction-pack architecture
- Exemption-cap review and asset/debt reconciliation
- Six-month current-monthly-income calculation
- Net-cash-flow calculation
- Structured tax-return, paystub, bank-statement, and credit-report extraction adapters
- Hard-audit flags for unresolved discrepancies
- Attorney override and declaration-gated signoff workflow
- Browser-based draft PDF preview and generation
- Synthetic fixtures and automated verification

These capabilities describe implemented software paths, not independent confirmation that every form, statute, threshold, rule, or generated packet is legally current or filing-ready.

## Product boundaries

| Area | Current status |
|---|---|
| Colorado Chapter 7 workflow | Implemented prototype |
| Chapter 11 and Chapter 13 | Architecture planned; not production-supported |
| Authentication and authorization | Not implemented in the public demo |
| Real client data | Prohibited |
| Attorney identity verification | Not implemented server-side |
| CM/ECF filing | Not implemented |
| Legal and form-currency certification | Required before production |
| Security certification | Required before production |

## Architecture

```text
Browser intake
    ↓
MasterCaseData single source of truth
    ├── provenance and verification status
    ├── extraction adapters
    ├── deterministic validators
    ├── form mappers
    ├── attorney review and overrides
    └── draft PDF generators
```

Key directories:

| Path | Purpose |
|---|---|
| `src/` | Browser demonstration and styling |
| `lib/types/` | Master case and field-wrapper contracts |
| `lib/engine/extraction/` | Structured document-extraction adapters |
| `lib/engine/validators/` | Deterministic calculations and audit flags |
| `lib/engine/mappers/` | Form-specific field mappings |
| `lib/engine/pdf/` | Draft PDF stamping and continuation rendering |
| `lib/engine/review/` | Field overrides, review summaries, and signoff gate |
| `lib/jurisdictions/` | Colorado jurisdiction configuration |
| `forms/` | Form manifest and metadata |
| `tests/` | Synthetic fixtures and automated tests |
| `.github/workflows/` | Pull-request and main-branch CI |

## Data model and provenance

Every material value can be wrapped in a `FieldWrapper<T>` containing:

- a stable field identifier;
- the normalized value;
- its source and extraction metadata;
- verification status;
- attorney notes;
- mapped form destinations.

The intended flow is:

1. Collect or extract a value.
2. Store it once in the master case model.
3. Validate it deterministically.
4. Map it into every required destination.
5. Resolve discrepancies.
6. Require supervising-attorney review.
7. Generate a draft packet.

See [the master data-model documentation](docs/data-model.md).

## Requirements

- [Bun](https://bun.sh/)
- TypeScript-compatible development environment
- Modern browser for the demonstration UI

## Install and verify

```bash
bun install
bun test
bun run typecheck
bun run build
```

The CI workflow runs the same test, typecheck, and build gates for pull requests and pushes to `main`.

Current verified repository baseline:

- 8 tests passing
- 28 assertions passing
- TypeScript typecheck passing
- production build passing

Historical files may mention larger test totals from earlier development environments. Treat the current CI run as the authoritative repository baseline.

## Run the browser demonstration locally

The repository uses TypeScript browser modules. Serve it through a development server rather than opening `index.html` directly:

```bash
bunx vite --host 0.0.0.0
```

Then open the local URL printed by Vite. Use synthetic information only.

## Safety and privacy

Never commit or enter:

- real SSNs, tax identifiers, birth dates, or account numbers;
- client names, addresses, creditor records, or case documents;
- CM/ECF credentials, API keys, passwords, or access tokens;
- signed forms or generated client PDF packets;
- screenshots or logs containing protected information.

Fixtures must use unmistakable placeholders such as `000-00-0000`, `EXAMPLE-VIN-NOT-VALID`, fictional organizations, and synthetic case IDs.

Read [SECURITY.md](SECURITY.md) and [the data-handling policy](docs/data-handling.md) before contributing.

## Attorney-review gate

A production implementation must enforce attorney approval on the server, not merely in browser code. At minimum:

1. Hard audit flags must be resolved.
2. Material fields must be reviewed or approved.
3. Attorney identity and authorization must be verified.
4. Approval must be timestamped and auditable.
5. Generated packets must remain labeled as drafts.
6. Filing must be a separate authorized attorney action.

## Production-readiness requirements

Before real client use, the release owner must obtain and record evidence that:

- official U.S. Courts form editions and effective dates are current;
- Colorado exemption statutes and configured amounts are current;
- District of Colorado local rules, procedures, standing orders, and local forms are current;
- means-test data and applicable effective dates are current;
- server-side authentication, role authorization, tenant isolation, and audit logging work;
- data is encrypted in transit and at rest;
- retention, deletion, legal-hold, backup, restore, and incident-response processes work;
- logs exclude protected data;
- PDF output has regression coverage;
- qualified bankruptcy counsel approves the workflow;
- an independent security review is complete.

Use [the release checklist](docs/release-checklist.md) as the evidence gate.

## Testing strategy

The current suite covers:

- six-month CMI calculations;
- household cash-flow integration;
- master-case traversal;
- attorney field overrides;
- declaration rejection;
- successful synthetic signoff;
- form mapping and draft PDF pipeline integration.

Future coverage should add versioned golden-file PDF comparisons, every supported form edition, malformed extraction inputs, jurisdiction boundary cases, accessibility checks, and end-to-end server-side authorization tests.

## Deployment

The public demonstration is deployed through AppDeploy:

[https://lexpetition-ai-engine-8prkk7.v2.appdeploy.ai/](https://lexpetition-ai-engine-8prkk7.v2.appdeploy.ai/)

Deployment verification currently covers:

- desktop demonstration entry;
- mobile acknowledgment and step navigation;
- rejection of attorney signoff without the required declaration;
- absence of frontend, backend, and network errors during final QA.

Deployment passing does not authorize real-data use.

## Roadmap

### Near term

- Add and enforce a dependency lockfile
- Record machine-readable form versions and effective dates
- Add PDF golden-file regression tests
- Expand synthetic edge-case fixtures
- Add accessibility and browser-compatibility checks
- Verify all Colorado rules with qualified counsel

### Production foundation

- Server-side identity and role management
- Firm and matter tenant isolation
- Encrypted document storage
- Secrets management
- Immutable audit events
- Retention and deletion enforcement
- Secure generated-PDF lifecycle
- Backup, restore, and incident-response testing

### Future chapters

Chapter 11 and Chapter 13 must remain disabled until their data models, calculations, forms, local requirements, tests, attorney workflows, and release evidence are separately implemented and approved.

## Documentation

- [Security policy](SECURITY.md)
- [Data handling and generated PDFs](docs/data-handling.md)
- [Release checklist](docs/release-checklist.md)
- [Master case data model](docs/data-model.md)
- [Multi-chapter expansion architecture](docs/multi-chapter-expansion-architecture.md)
- [Technical audit history](AUDIT_REPORT.md)
- [Build status history](STATUS.md)
- [State handoff history](STATE_HANDOFF.md)
- [Contribution guide](CONTRIBUTING.md)

Historical audit, status, and handoff documents record prior implementation claims. They are not independent legal, security, or production certifications.

## Contributing

Use a branch and pull request. Add or update tests for behavioral changes and run all verification commands before requesting review.

Changes involving statutes, exemptions, court rules, form mappings, means-test data, or filing behavior require:

- an authoritative source citation;
- effective-date metadata;
- regression tests;
- review by qualified bankruptcy counsel.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

The package is currently marked `UNLICENSED`. No permission to copy, redistribute, sublicense, or use the project commercially is granted unless the repository owner supplies a separate license.
