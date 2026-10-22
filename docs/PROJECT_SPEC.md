# Project specification: aether-ai-web

**Status:** documentation-only / not implemented.

## Purpose

User-facing web application for chat, workspaces, agent runs, files, settings, and administration views.

## Responsibilities

Presentation only; no provider secrets or privileged provider calls in browser code.

## In scope

- Define a narrow, versioned contract for this component.
- Validate inputs and reject invalid or unauthorized requests at the boundary.
- Emit structured, redacted logs and stable error categories.
- Provide unit, contract, and integration-test plans before implementation.
- Document configuration, operational behavior, failure modes, and ownership.

## Out of scope

- Calling model providers directly from browser code.
- Duplicating another repository's business logic.
- Deploying production infrastructure during the documentation phase.
- Treating a design proposal as an already implemented feature.

## Consumers and dependencies

aether-ai-api, aether-ai-ui-components, generated public API types.

## Requirements

1. Use explicit interfaces and versioned contracts; do not couple consumers to internal classes or database tables.
2. Validate untrusted input, enforce tenant/user authorization, and apply limits/timeouts where relevant.
3. Make retries and side effects explicit. Any retryable operation with side effects must have an idempotency strategy.
4. Define observable success, failure, cancellation, and timeout states.
5. Make configuration schema-driven, documented, and safe by default.
6. Add accessibility requirements for user-facing behavior and data-retention rules for persisted data.

## Acceptance criteria before coding

- [ ] API/data/event contracts are written and reviewed.
- [ ] Dependency directions and forbidden dependencies are clear.
- [ ] Security/privacy threats and mitigations are recorded.
- [ ] Unit, contract, integration, and negative tests are listed.
- [ ] License and version checks for reused components are complete.
- [ ] A maintainer can explain the component's purpose and its connection to the full system from these docs alone.

## Non-negotiable rules

- Documentation-first: no application implementation until the cross-repository contracts and this plan are reviewed.
- Never assume an external project is licensed for reuse based only on its name. Verify each repository's LICENSE, notices, dependency licenses, version, and redistribution conditions before vendoring or modifying code.
- Do not commit API keys, tokens, production URLs with credentials, personal data, or real customer documents.
- Public APIs, trust boundaries, non-obvious decisions, and failure/retry behavior must be documented.
- Any later implementation PR must update these docs and add tests for the changed behavior.
