---
title: Reasoning vs Execution
description: Separation of AI reasoning from system execution authority.
tags: [ai, systems]
---

# Reasoning vs Execution

AI systems must separate reasoning from execution.

Core Features

* Reasoning Layer: LLM interprets intent
* Execution Layer: Deterministic system acts

Why it matters

Prevents:

* hallucinated actions
* unsafe execution
* agent misuse

Integration

Core to:

* [[llm-as-untrusted-component]]
* [[agent-systems]]

```mermaid
flowchart LR
    Input --> LLM --> Intent --> Policy --> Execution
```

See also

* [[agent-overreach]]
* [[prompt-injection]]
