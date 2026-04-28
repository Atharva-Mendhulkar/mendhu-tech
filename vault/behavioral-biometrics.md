---
title: Behavioral Biometrics
description: Identifying users based on behavior rather than credentials.
tags: [ml, security]
---

# Behavioral Biometrics

Users are identified by how they behave, not what they know.

Core Features

* typing patterns
* touch dynamics
* navigation behavior

Why it matters

Prevents:

* SIM swap fraud
* account takeover
* bot attacks

Integration

Core to:

* [[anomaly-detection]]
* [[session-risk-scoring]]

```mermaid
flowchart LR
    Behavior --> Features --> Model --> IdentityScore["Identity Score"]
```

See also

* [[feature-engineering]]
