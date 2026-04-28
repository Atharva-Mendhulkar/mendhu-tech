---
title: Tool Execution Guard
description: Control layer for validating tool usage by agents.
tags: [security, tools]
---

# Tool Execution Guard

Ensures only approved tools are executed with valid permissions.

Core Features

* Tool registration
* Permission checks
* Execution validation

Integration

Used in:

* [[agent-runtime-authority]]
* [[tool-augmented-agents]]

```mermaid
sequenceDiagram
    Agent->>Guard: Call Tool
    Guard->>Policy: Validate
    Policy-->>Guard: Allow/Deny
```

See also

* [[prompt-injection]]
* [[agent-overreach]]
