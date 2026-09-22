# Security Policy

## Supported use

This repository is a pre-production prototype. It is not approved for real client data, filing credentials, CM/ECF credentials, or production bankruptcy work.

## Reporting a vulnerability

Do not open a public issue containing sensitive information. Contact the repository owner privately through the security contact configured on the owner's GitHub profile. Include reproduction steps, affected files, and impact without including real client data.

## Required controls before production

A production release requires independent security review; server-side authentication and role-based authorization; encryption in transit and at rest; tenant isolation; auditable attorney approval; secrets management; retention and deletion enforcement; PII-safe logging; incident response; dependency scanning; and backup/restore testing.

Browser-side gates, local storage, session storage, hidden UI, or embedded passkeys are not security controls.
