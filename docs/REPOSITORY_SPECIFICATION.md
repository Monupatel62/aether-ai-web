# Repository specification: aether-ai-web

**Status:** Repository exists; documentation-only on the inspected `main` branch. No application implementation is present in the audited tree.

## Mission

Browser UI for chat, workspace, model selection, conversation history, agent runs, files, settings, and accessible user flows.

## Responsibility boundary

Presentation only; never store provider secrets or call privileged provider APIs directly.

## Dependencies and connections

aether-ai-api, aether-ai-ui-components, and the generated public client/types from aether-ai-sdk.

## Owned capabilities

UI routes, typed API client usage, streaming UX, accessibility, error/loading/empty states, browser security.

## Must not own

- Responsibilities explicitly assigned to another repository in the master catalog.
- Product UI, provider secrets, or privileged actions outside this repository's boundary.
- Unreviewed direct database access into another component's private schema.
- Unversioned cross-repository APIs or hidden side effects.

## Required public contracts

- A typed/versioned interface with documented inputs, outputs, error cases, limits, and compatibility policy.
- Explicit auth/tenant context where data or actions are user-scoped.
- Correlation/run identifiers and structured, redacted lifecycle events.
- Timeouts, retry behavior, cancellation, idempotency, and partial-failure semantics where applicable.

## Security and privacy

- Treat model output, external APIs, uploaded content, workflow definitions, and MCP responses as untrusted.
- Enforce least privilege and tenant isolation at every data/tool boundary.
- Keep credentials server-side and use the approved secret mechanism; never log tokens or raw secrets.
- Define retention, deletion, payload limits, and redaction before persisting prompts, files, or run results.

## Test plan

- Unit tests for domain rules and input validation.
- Contract tests for every direct upstream dependency.
- Negative tests for unauthorized access, malformed inputs, excessive payloads, and missing capabilities.
- Failure tests for timeouts, dependency outages, retries, duplicate requests, and cancellation.
- Integration/smoke test in a non-production environment before release.

## Implementation gates

1. Finish documentation and resolve open ADRs.
2. Pin and license-check every dependency and selected upstream version.
3. Implement a minimum vertical slice only within this repository's boundary.
4. Add tests, observability, security checks, and operational instructions with the implementation.
5. Update this specification and the master catalog in the same change when contracts or ownership change.

## Related documentation

- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
- [Architecture](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/MASTER_ARCHITECTURE.md)
- [Implementation roadmap](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/IMPLEMENTATION_ROADMAP.md)
- [Decision log](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/DECISION_LOG.md)

## Research references

- [AI DIAL Core](https://github.com/epam/ai-dial-core) — model gateway reference; repository includes Apache-2.0 LICENSE.
- [AI DIAL Chat](https://github.com/epam/ai-dial-chat) — modular UI/BFF reference; check file-level license notices before reuse.
- [AI DIAL documentation](https://github.com/epam/ai-dial) and [MCP specification](https://modelcontextprotocol.io/) where relevant.

These are design references, not a statement that their code has been copied or that all components share one license.
