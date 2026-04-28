---
title: Failure Cascades
description: Chain reactions of failures in distributed systems.
tags: [systems]
---

# Failure Cascades

Failures in one component propagate to others.

Core Features

* dependency chains
* amplification effects
* systemic risk

Integration

Seen in:

* [[multi-agent-systems]]
* [[agent-overreach]]

```mermaid
flowchart LR
    FailureA --> FailureB --> FailureC
```

See also

* [[circuit-breaker-pattern]]
* [[backpressure]]
