---
title: RAG Systems
description: Retrieval-Augmented Generation systems combining LLMs with external knowledge.
tags: [ai, rag]
---

# RAG Systems

RAG combines retrieval with generation for better responses.

Core Features

* External knowledge retrieval
* Context injection
* Improved accuracy

Risks

* Data poisoning
* Hidden instructions
* Permission bypass

Integration

Used in:

* [[tool-augmented-agents]]
* [[llm-as-untrusted-component]]

```mermaid
flowchart LR
    Query --> Retriever --> Context --> LLM --> Output
```

See also

* [[prompt-injection]]
* [[agent-overreach]]
