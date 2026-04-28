---
title: Backpressure
description: Mechanism to control system overload by limiting input rate.
tags: [systems]
---

# Backpressure

Controls the rate of incoming requests to prevent overload.

Core Features

* flow control
* load regulation
* system stability

Integration

Used in:

* [[async-systems]]
* [[event-driven-architecture]]

```mermaid
flowchart LR
    Producer --> Queue --> Consumer
    Queue --> Limit
```

See also

* [[failure-cascades]]
