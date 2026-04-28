---
title: LSTM Autoencoder
description: Neural network model for sequence anomaly detection.
tags: [ml]
---

# LSTM Autoencoder

Models sequential data and detects anomalies via reconstruction error.

Core Features

* sequence learning
* reconstruction error
* temporal modeling

Integration

Used in:

* [[time-series-modeling]]
* [[anomaly-detection]]

```mermaid
flowchart LR
    Sequence --> Encoder --> Decoder --> Reconstruction --> Error
```

See also

* [[dynamical-systems]]
