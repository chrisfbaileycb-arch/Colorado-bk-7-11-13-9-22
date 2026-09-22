# Release Checklist

A release owner must record evidence for every item. “Implemented” is not equivalent to “verified.”

## Engineering

- [ ] Clean install succeeds from the lockfile.
- [ ] Tests, typecheck, and production build pass in CI.
- [ ] PDF output regression fixtures pass for every supported form.
- [ ] Dependency and secret scans pass.
- [ ] Backup and restore are tested.

## Legal and form currency

- [ ] A qualified Colorado bankruptcy attorney verifies every exemption rule and amount.
- [ ] Official U.S. Courts form editions and effective dates are recorded in machine-readable metadata.
- [ ] District of Colorado local rules, general procedures, standing orders, and required local forms are verified.
- [ ] Means-test data and effective dates are verified against authoritative sources.
- [ ] Chapter 11 and Chapter 13 remain disabled until separately implemented and verified.

## Privacy and security

- [ ] Independent security review is complete.
- [ ] Server-side authentication, authorization, tenant isolation, encryption, audit trails, secrets management, retention, deletion, and incident response are tested.
- [ ] No real client data exists in source, fixtures, logs, screenshots, or deployment history.
- [ ] Generated PDFs and temporary files follow the approved lifecycle.

## Attorney gate

- [ ] Export remains “DRAFT — NOT FILED.”
- [ ] Hard audit flags block approval.
- [ ] Supervising attorney identity and approval are server-validated and auditable.
- [ ] Filing remains a separate authorized attorney action.
