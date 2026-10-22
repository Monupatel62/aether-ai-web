# Technical design — aether-ai-web

**Status:** design proposal; not implemented.

## Role

Browser experience is a React-like SPA candidate, but framework selection is still an ADR, not a final decision.

## Proposed internal structure

Owns routes/views for chat, conversation list, model selection, run status, tool approval, files/knowledge, settings, and admin only if separate admin UI is intentionally embedded. Use typed API client; keep streaming/reconnect UX separate from business authorization.

## Connections and ownership

Web calls only aether-ai-api. Gateway/provider credentials must never be present in browser bundles. On 401/403, show safe states; on streaming disconnect, reconnect only using documented run/session semantics; don't retry unsafe mutations without idempotency.

## Failure cases to design explicitly

- Invalid or unauthorized input.
- Dependency unavailable or responds with malformed/partial data.
- Timeout, cancellation, duplicate delivery/request, and retry exhaustion.
- Tenant or permission mismatch.
- Sensitive data accidentally entering logs or client-visible errors.

## Verification plan

Component/unit tests, accessibility/keyboard tests, API contract tests, mocked SSE/stream interruption tests, auth/permission UI tests, and browser bundle secret scanning.

## Open decisions

- Final language/framework and packaging model.
- Runtime deployment boundary (repository does not imply a separate service).
- Selected dependency versions and license review.
- Production observability/retention limits and release criteria.

## Change-comment policy

When implementation begins, explain security invariants, state transitions, retry/idempotency constraints, and non-obvious integration behavior in comments. Keep the comment standard at [the project-wide guide](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/ENGINEERING_AND_COMMENTING_STANDARD.md).

## Related docs

- [Project specification](PROJECT_SPEC.md)
- [Architecture](ARCHITECTURE.md)
- [Dependencies and contracts](DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](IMPLEMENTATION_PLAN.md)
- [Research and licenses](RESEARCH_AND_LICENSES.md)
- [Work log](WORKLOG.md)
- [Master repository spec](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/repositories/aether-ai-web.md)
