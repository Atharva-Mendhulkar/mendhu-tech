---
title: Control Plane vs Data Plane
description: Separation between decision-making and execution layers.
tags: [systems]
---

# Control Plane vs Data Plane

Systems separate:

* Control Plane → decisions, policies
* Data Plane → execution

Core Features

* clear separation of concerns
* scalable execution
* centralized decision logic

Integration

Core to:

* [[policy-engine]]
* [[reasoning-vs-execution]]

```mermaid
flowchart LR
    Control --> Decision --> Data --> Execution
```

See also

* [[deterministic-control-plane]]
