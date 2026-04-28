---
title: Zero Trust Architecture
description: Security model where nothing is trusted by default.
tags: [security]
---

# Zero Trust Architecture

Every component is treated as potentially compromised.

Core Features

* No implicit trust
* Continuous verification
* Strict access control

Integration

Applied to:

* [[llm-as-untrusted-component]]
* [[runtime-governance]]

```mermaid
flowchart LR
    Request --> Verify --> Access
```

See also

* [[intent-validation]]
* [[policy-engine]]
