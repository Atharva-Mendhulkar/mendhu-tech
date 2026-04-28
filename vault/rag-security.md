---
title: RAG Security
description: Securing retrieval-augmented generation pipelines.
tags: [security, ai]
---

# RAG Security

Protects systems using external knowledge sources.

Core Features

* Source validation
* Instruction filtering
* Access control

Risks addressed

* [[prompt-injection]]
* [[agent-overreach]]

Integration

Used in:

* [[rag-systems]]
* [[tool-augmented-agents]]

```mermaid
flowchart LR
    Retriever --> Filter --> SafeContext --> LLM
```

See also

* [[intent-validation]]
