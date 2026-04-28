---
title: One-Class SVM
description: Model for detecting anomalies using only normal data.
tags: [ml]
---

# One-Class SVM

Learns the boundary of normal data and flags outliers.

Core Features

* unsupervised learning
* boundary detection
* anomaly scoring

Integration

Used in:

* [[anomaly-detection]]
* [[behavioral-biometrics]]

```mermaid
flowchart LR
    NormalData[Normal Data] --> Model --> Boundary --> Outlier?
```

See also

* [[statistical-learning]]
