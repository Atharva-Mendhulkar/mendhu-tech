---
title: API Gateway Pattern
description: Central entry point for managing and routing requests.
tags: [systems]
---

# API Gateway Pattern

Acts as a single entry point for clients.

Core Features

* request routing
* authentication
* rate limiting

Integration

Used in:

* [[agent-runtime-authority]]
* [[tool-execution-guard]]

```mermaid
flowchart LR
    Client --> Gateway --> Services
```

See also

* [[observability]]
