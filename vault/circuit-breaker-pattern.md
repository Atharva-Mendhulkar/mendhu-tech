---
title: Circuit Breaker Pattern
description: Mechanism to halt risky or anomalous actions.
tags: [security, systems]
---

# Circuit Breaker Pattern

Stops execution when risk exceeds acceptable thresholds.

Core Features

* Automatic halting
* Threshold-based triggers
* Recovery mechanisms

Integration

Used in:

* [[agent-runtime-authority]]
* [[event-driven-architecture]]

```mermaid
flowchart LR
    Action --> Check --> Safe? --> Execute
    Check --> Risk --> Halt
```

See also

* [[approval-workflows]]
* [[agent-overreach]]
