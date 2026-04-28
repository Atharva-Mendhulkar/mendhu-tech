---
title: Agent Identity & IAM
description: Identity and access management for autonomous agents.
tags: [security, identity]
---

# Agent Identity & IAM

Agents must have identities, roles, and permissions.

Core Features

* Unique identity
* Scoped permissions
* Access control

Integration

Critical for:

* [[agent-runtime-authority]]
* [[tool-execution-guard]]

```mermaid
flowchart LR
    Agent --> Identity --> Permissions --> Access
```

See also

* [[consent-token]]
* [[audit-ledger]]
