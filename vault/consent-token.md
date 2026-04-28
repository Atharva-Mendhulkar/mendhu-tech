---
title: Consent Token
description: Secure authorization mechanism for executing actions.
tags: [security]
---

# Consent Token

A token representing user-approved actions.

Core Features

* Scoped permissions
* Single-use
* Time-bound validity

Integration

Used in:

* [[policy-engine]]
* [[approval-workflows]]

```mermaid
flowchart LR
    User --> Approve --> Token --> Execute
```

See also

* [[agent-identity-iam]]
