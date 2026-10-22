# Engineering and Commenting Standard

This repository follows the Aether AI project-wide standard: [Engineering and Commenting Standard](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/ENGINEERING_AND_COMMENTING_STANDARD.md).

## Required practice

- Comments explain **why**, invariants, security assumptions, non-obvious tradeoffs, retry/cancellation behavior, and cross-component contracts. They must not merely restate the code.
- Public APIs and exported package functions document purpose, inputs, outputs, errors, side effects, cancellation, and compatibility.
- Security-sensitive logic documents the trust boundary and the reason for the check.
- Retry/idempotency/state-machine code documents which operations can be replayed and what happens after partial failure.
- Every cross-repository call names the public contract/package used and updates the master dependency catalog if the edge changes.
- TODO/FIXME comments explain what is missing and include a tracking issue when issue tracking exists. Never leave security controls as TODOs in a release path.
- Any change to API shape, events, permissions, retention, configuration, or runtime behavior updates the specification, tests, and work log in the same change.

**Current status:** documentation only. No application code has been added in this repository as part of the documentation phase.
