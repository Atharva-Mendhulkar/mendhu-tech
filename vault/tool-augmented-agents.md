---
title: Tool-Augmented Agents
description: Agents enhanced with external tool capabilities.
tags: [ai, agents, tools]
---

# Tool-Augmented Agents

Agents extend capabilities by using tools like APIs, databases, and services.

Core Features

* External tool access
* Dynamic execution
* Context-aware actions

Risks

* Unauthorized tool usage
* Data leakage
* Execution abuse

Integration

Used in:

* [[agent-systems]]
* [[rag-systems]]

```mermaid
sequenceDiagram
    Agent->>Tool: API Call
    Tool-->>Agent: Response
```

See also

* [[prompt-injection]]
* [[agent-overreach]]
