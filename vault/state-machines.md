---
title: State Machines
description: Systems modeled as transitions between defined states.
tags: [systems]
---

# State Machines

Systems transition between predefined states based on inputs.

Core Features

* deterministic transitions
* predictable behavior
* explicit states

Integration

Used in:

* [[policy-engine]]
* [[approval-workflows]]

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing
    Processing --> Complete
```

See also

* [[control-plane-vs-data-plane]]
