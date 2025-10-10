---
title: monitor, trace, and collect metrics
---

How to
- Start metrics services (e.g., Prometheus) from `lifespan` and update counters during runtime.

Example
```python
from prometheus_client import start_http_server, Counter

metrics_counter = Counter('app_start', 'App has started')

async def lifespan(app):
    start_http_server(9000)  # separate metrics port
    metrics_counter.inc()
    yield
```

References
- http/lifespan.md:1
