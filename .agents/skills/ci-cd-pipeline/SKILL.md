---
name: ci-cd-pipeline
description: Create or review continuous integration and delivery pipelines that build, lint, type-check, test, scan and release software with least-privilege permissions and pinned dependencies. Use when setting up GitHub Actions or another CI system, adding checks to pull requests, automating releases or container publishing, configuring Dependabot, or hardening an existing workflow.
license: MIT
metadata:
  version: "1.0.0"
---

# CI/CD Pipeline

A pipeline turns "it works on my machine" into "it works, every time, for everyone". It must be fast, reproducible and secure.

## 1. Pipeline stages

| Stage | Runs on | Contents | Fails the build when |
| :--- | :--- | :--- | :--- |
| Verify | Every pull request and push to the default branch | Install from lockfile, format check, lint, type-check, unit and integration tests, dependency audit, secret scan, SAST | Any check fails |
| Build | Default branch and release tags | Build the artifact once (package, binary or container image), generate an SBOM | Build or scan fails |
| Release | Version tags (`v1.2.3`) | Push the artifact, attach build provenance, create release notes | Signing or push fails |
| Deploy | After release, per environment | Deploy the **same** artifact digest to staging, verify, then promote to production | Health checks or smoke tests fail |

Use the project's own scripts (`npm test`, `make test`, `nox`, ...) in CI so local and CI runs match.

## 2. Templates (verified with actionlint 1.7.12 and zizmor 1.30.1 on 2026-10-14)

- [assets/github-actions/ci-node.yml](assets/github-actions/ci-node.yml): Node.js matrix (22, 24, 26): `npm ci`, lint, type-check, test, `npm audit`.
- [assets/github-actions/ci-python.yml](assets/github-actions/ci-python.yml): Python matrix (3.11 to 3.14): install with a PEP 735 `dev` dependency group, Ruff, mypy, pytest, pip-audit.
- [assets/github-actions/release-container.yml](assets/github-actions/release-container.yml): on a version tag, build and push an image to GitHub Container Registry with SBOM and signed build provenance.
- [assets/github-actions/dependabot.yml](assets/github-actions/dependabot.yml): weekly updates for actions and npm, with a 7-day cooldown.

The action versions are pinned to full commit SHAs, with the version in a comment. These SHAs were resolved from the actions' release tags on 2026-10-14. Dependabot keeps the SHAs and comments updated.

## 3. Security rules for workflows

- **Least privilege**: set `permissions: contents: read` at the top level; grant extra scopes only on the job that needs them, with a comment saying why.
- **Pin third-party actions to a full commit SHA** (`uses: owner/action@<40-char-sha> # vX.Y.Z`). Tags can be moved; SHAs cannot.
- `actions/checkout` with `persist-credentials: false` unless a later step must push.
- **Untrusted input**: never interpolate `${{ github.event.* }}` fields (titles, branch names, bodies) directly into `run:` scripts. Pass them through `env:` and quote the variable.
- **Pull requests from forks** get no secrets. Avoid `pull_request_target` and `workflow_run` with checkout of untrusted code; if unavoidable, never run that code with secrets.
- Prefer OIDC federation (`id-token: write`) to long-lived cloud credentials.
- Set `timeout-minutes` on every job and `concurrency` to cancel superseded runs.
- Lint workflows with `actionlint` and audit them with `zizmor` (see [security-hardening tools](../security-hardening/references/tools.md)).

## 4. Speed and reliability

- Cache dependencies by lockfile hash (`actions/setup-node` and `actions/setup-python` have a `cache` input).
- Run independent jobs in parallel; use a matrix for supported runtime versions.
- Keep the pull-request pipeline under about 10 minutes. Move long suites (end-to-end, fuzzing, mutation) to scheduled or pre-release runs.
- A flaky check is a bug: fix it, don't retry it blindly.
- Make required status checks mandatory with branch protection, so nothing merges red.

## 5. Other CI systems

The same principles apply to GitLab CI (`.gitlab-ci.yml`), Azure Pipelines, CircleCI, Jenkins and Buildkite: reproducible installs, least-privilege tokens, pinned images and plugins, protected secrets for protected branches only, and one build promoted through environments. Check the platform's documentation for exact syntax; do not translate GitHub Actions syntax by guesswork.

## 6. Checklist

- [ ] Every pull request runs format, lint, type-check, tests, dependency audit and secret scan
- [ ] Top-level `permissions: contents: read`; extra scopes only per job, commented
- [ ] All third-party actions pinned to commit SHAs; Dependabot or Renovate keeps them current
- [ ] No untrusted `${{ }}` expressions inside `run:` scripts
- [ ] Jobs have timeouts; superseded runs are cancelled
- [ ] Releases build once and attach an SBOM and provenance; deployments use the artifact digest
