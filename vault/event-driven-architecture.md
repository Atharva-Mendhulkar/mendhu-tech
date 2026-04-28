---
title: Event Driven Architecture
description: Systems that react to events rather than direct requests.
tags: [systems, architecture]
---

# Event Driven Architecture

Components communicate via events instead of direct calls.

Core Features

* Loose coupling
* Asynchronous execution
* Scalability

Integration

Used in:

* [[distributed-systems]]
* [[circuit-breaker-pattern]]

```mermaid
flowchart LR
    Producer --> Event --> Consumer
```

See also

* [[async-systems]]
* [[backpressure]]
