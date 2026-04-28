---
title: Prompt Injection
description: Attacks that manipulate LLM behavior through input.
tags: [security, ai]
---

# Prompt Injection

Prompt injection exploits LLM trust in input data.

Core Features

* Instruction hijacking
* Context manipulation
* Hidden directives

Impact

* Data leakage
* Unauthorized actions
* System compromise

Integration

Critical for:

* [[rag-systems]]
* [[llm-as-untrusted-component]]

```mermaid
sequenceDiagram
    Attacker->>LLM: Malicious prompt
    LLM->>System: Altered instruction
    System: Executes unintended action
```

See also

* [[agent-overreach]]
* [[reasoning-vs-execution]]
