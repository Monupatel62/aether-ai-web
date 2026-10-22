# Security Review Checklist — aether-ai-web

**Status:** design-stage checklist; not evidence of implemented controls. This file must be updated alongside code and tests.

## Trust boundary

Browser/client boundary

## Main threat scenarios

The browser is untrusted. XSS, token theft, malicious extensions, and accidental exposure of provider credentials are key risks.

## Required controls

No provider secrets in bundles or local logs. Use secure session/token handling, output encoding, CSP where applicable, strict file rendering, safe Markdown sanitization, and explicit confirmation UI for high-impact actions. UI approval is not a substitute for backend authorization.

## Verification checklist

- [ ] Threat scenarios mapped to tests and acceptance criteria.
- [ ] Unauthorized and cross-tenant operations fail closed.
- [ ] Malformed/oversized input and output are rejected or bounded.
- [ ] Timeouts, retries, cancellation, and duplicate side effects are tested.
- [ ] Secrets and sensitive content are absent from default logs/traces.
- [ ] Dependency versions, license terms, and known vulnerabilities are reviewed.
- [ ] High-impact actions have explicit approval/policy requirements.
- [ ] Operational response and rollback are documented before production use.

## Project-wide reference

Read the [Aether AI security threat model](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/SECURITY_THREAT_MODEL.md) and [architecture audit](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/ARCHITECTURE_AUDIT.md). Use the current [OWASP GenAI Top 10 project](https://owasp.github.io/www-project-top-10-for-large-language-model-applications/) and verify the 2026 edition against the canonical publication. Do not treat prompts, tool descriptions, or UI confirmations as authorization controls.

## Change log

- 2026-10-22: Initial design-stage threat checklist added. No application code or security controls are claimed to be implemented.
