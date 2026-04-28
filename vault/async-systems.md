---
title: Asynchronous Systems
description: Systems where tasks execute independently of request-response cycles.
tags: [systems]
---

# Asynchronous Systems

Tasks execute without blocking the main flow.

Core Features

* non-blocking execution
* concurrency
* scalability

Integration

Used in:

* [[event-driven-architecture]]
* [[distributed-systems]]

```mermaid
flowchart LR
    Request --> Queue --> Worker --> Result
```

See also

* [[backpressure]]
