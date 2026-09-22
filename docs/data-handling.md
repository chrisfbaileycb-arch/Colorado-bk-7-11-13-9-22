# Data Handling, Retention, and Generated PDFs

## Current rule

Use synthetic data only. Do not enter, upload, commit, log, or deploy real client PII in this prototype.

## Production requirements

Before real client data is allowed, the product owner and supervising counsel must approve a written policy covering collection minimization, lawful purpose, access roles, encryption, geographic storage, backups, retention periods, legal holds, deletion, breach response, vendor review, and client notice.

Application logs must exclude SSNs, tax identifiers, account numbers, full birth dates, document contents, authentication secrets, and generated PDF contents. Use opaque case and request identifiers.

Generated PDFs must be encrypted at rest, access-controlled, auditable, treated as drafts, and deleted under a documented retention schedule. Temporary files must be securely removed after generation. No filing-ready packet may be exported until a supervising attorney records approval.

Fixtures in source control must use unmistakable placeholders such as `000-00-0000`, `EXAMPLE-VIN-NOT-VALID`, and fictional organizations.
