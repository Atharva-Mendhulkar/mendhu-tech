---
title: Floework — Real-time Behavioral Telemetry
description: Distributed tracing for human interaction patterns.
tags: [systems, product]
---

# Floework (Real-time Behavioral Telemetry)

Floework is a distributed tracing system designed to capture and analyze **human interaction sequences** in real-time.

## The Objective
Standard APM (Application Performance Monitoring) tracks CPU and Memory. Floework tracks **Flow**. 
- Where does the user hesitate?
- Which interaction sequence leads to a "Predictive Hang"?

## Integration
Floework hooks into the UI event loop and streams high-fidelity telemetry to a Go-based ingestion engine.

```mermaid
graph LR
    A[Client UI] -- Protocol Buffers --> B[Ingestion Engine]
    B --> C[Stream Processor]
    C --> D[K-PHD Analysis]
    D --> E[Real-time Feedback]
```

Related: [[K-PHD]] uses Floework signals to predict kernel-level stalls.
