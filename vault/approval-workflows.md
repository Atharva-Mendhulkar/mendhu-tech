---
title: Approval Workflows
description: Human-in-the-loop control for high-risk actions.
tags: [security, governance]
---

# Approval Workflows

High-risk actions require explicit approval before execution.

Core Features

* Manual approval
* Escalation paths
* Decision tracking

Integration

Used with:

* [[circuit-breaker-pattern]]
* [[policy-engine]]

```mermaid
flowchart LR
    Risk --> Pending --> Human --> Approve/Deny
```

See also

* [[consent-token]]
