---
name: security-hardening
description: Threat-model a feature, review and harden code and configuration against OWASP Top 10:2025 and OWASP ASVS 5.0, and set up secret scanning, static analysis, dependency and container scanning, and SBOM generation. Use when building authentication, authorization, payments, file uploads or anything handling personal data, before a release, after a security finding, or when asked to make code or infrastructure secure.
license: MIT
metadata:
  version: "1.0.0"
---

# Security Hardening

The always-on baseline is [06-security](../../rules/06-security.md). This skill adds the procedure. Scanner commands are in [references/tools.md](references/tools.md).

## 1. Threat-model before building

For any feature that touches authentication, money, personal data, file handling, external callbacks or administration, write a short threat model:

1. **Assets**: what must be protected (accounts, personal data, money, secrets, availability).
2. **Entry points and trust boundaries**: where untrusted data enters (HTTP, queues, files, webhooks, third-party APIs, LLM output).
3. **Threats per boundary**, using STRIDE as a prompt: **S**poofing, **T**ampering, **R**epudiation, **I**nformation disclosure, **D**enial of service, **E**levation of privilege.
4. **Mitigations** for each threat, each linked to a requirement or a test.

## 2. Pick a verification level

[OWASP ASVS 5.0](https://owasp.org/www-project-application-security-verification-standard/) defines three levels. Use Level 1 as the minimum for any internet-facing application, Level 2 for applications handling sensitive data or business transactions, and Level 3 for the most critical systems. Use the ASVS requirements as the review checklist for the chosen level.

## 3. Harden the application

| Area | Minimum |
| :--- | :--- |
| Authentication | Maintained library or identity provider; Argon2id, scrypt or bcrypt for passwords; rate limiting and lockout on login; MFA available for privileged accounts |
| Sessions and tokens | Short-lived access tokens; revocable refresh tokens; cookies `Secure; HttpOnly; SameSite=Lax` (or `Strict`); rotate the session ID on login |
| Authorization | Central, deny-by-default checks on every request and object; tests for "user A cannot read user B's data" |
| Input | Schema validation with size limits at every boundary; parameterized queries; no shell string building |
| Output | Context-aware encoding; JSON APIs set `Content-Type: application/json` |
| HTTP headers | `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `frame-ancestors` in CSP (or `X-Frame-Options`) |
| CORS | Explicit allow-list of origins; never reflect arbitrary origins together with credentials |
| Rate limits | Per user and per IP on authentication, expensive and enumerable endpoints |
| Errors and logs | Generic error responses; security events logged (login, permission denied, admin actions) without secrets |
| Files | Size and type limits, stored outside the web root, random names, served with `Content-Disposition` |

### Applications that use LLMs
Apply the [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/): treat model output as untrusted input; keep secrets and authorization decisions out of prompts; give tools the least privilege; require human approval for high-impact actions; mark external content clearly as data.

## 4. Secure the supply chain and pipeline

- Lockfiles committed; reproducible installs in CI; automated dependency updates (Dependabot or Renovate).
- Secret scanning in pre-commit hooks and in CI (gitleaks).
- Dependency vulnerability audit in CI (ecosystem tool or OSV-Scanner); fail on high and critical findings with a documented exception process.
- Static analysis (Semgrep, CodeQL, Bandit, gosec) on every pull request.
- CI hardening per [ci-cd-pipeline](../ci-cd-pipeline/SKILL.md): read-only default permissions, actions pinned to commit SHAs, no secrets exposed to untrusted pull requests.
- Containers: minimal base images, non-root user, image scanning (Trivy or OSV-Scanner), an SBOM per release (Syft or Trivy, in CycloneDX or SPDX format).

## 5. Secrets management

- Development: `.env` files that are git-ignored, with a committed `.env.example`.
- CI: the platform's encrypted secrets, scoped to the environments that need them; prefer OIDC federation to long-lived cloud keys.
- Production: a secret manager (cloud provider secret manager, HashiCorp Vault, or Kubernetes Secrets with encryption at rest), rotated regularly.
- Leaked secret: revoke and rotate immediately, then remove it from history, and check access logs for misuse.

## 6. Verify

- Run the scanners in [references/tools.md](references/tools.md) and triage every finding: fix it, or document why it is a false positive.
- Write tests for security requirements: authorization denials, input limits, rejected tokens, rate limits.
- Review the change with the security section of [rigorous-code-audit](../rigorous-code-audit/SKILL.md).

## Report

List each threat or finding with severity, the mitigation applied, the test or scan that verifies it, and any accepted residual risk that needs the user's sign-off.
