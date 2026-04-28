---
title: LLM as Untrusted Component
description: Treating LLMs as non-authoritative reasoning layers.
tags: [ai, security]
---

# LLM as Untrusted Component

LLMs generate outputs probabilistically and must not be trusted with execution authority.

Core Features

* Non-deterministic outputs
* Prompt sensitivity
* No inherent safety guarantees

Principle

LLM = Suggestion engine, not decision engine

Integration

Used in:

* [[reasoning-vs-execution]]
* [[prompt-injection]]

```mermaid
sequenceDiagram
    User->>LLM: Input
    LLM-->>System: Suggested action
    System->>Policy: Validate
    Policy-->>System: Approve/Deny
```

See also

* [[agent-overreach]]
* [[rag-systems]]
