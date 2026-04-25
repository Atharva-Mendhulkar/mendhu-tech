---
title: K-PHD — Kernel-level Predictive Hang Detector
description: Predictive CPU starvation monitoring inside the Linux scheduler.
tags: [systems, kernel]
---

# K-PHD (Kernel-level Predictive Hang Detector)

K-PHD is a Linux kernel module that embeds into the scheduler hot-path to measure nanosecond-level process wait times.

## Mechanics
By hooking into `sched_switch` and `sched_wakeup` tracepoints, K-PHD computes an Exponential Moving Average (EMA) of wait latencies for every PID.

## Prediction
If the EMA exceeds a threshold (e.g., 5ms), K-PHD signals a **Predictive Hang** via Netlink to userspace before the application actually freezes.

```c
// Example tracepoint hook
TRACE_EVENT(sched_switch,
    TP_PROTO(bool preempt, struct task_struct *prev, struct task_struct *next),
    ...
);
```

Related: [[Floework]] uses similar behavioral signals but at the application layer.
