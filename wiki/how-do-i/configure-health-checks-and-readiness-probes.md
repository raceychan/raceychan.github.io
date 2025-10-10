---
title: configure health checks and readiness probes
---

How to
- Expose a lightweight health endpoint in your app, then configure probes in Kubernetes or Docker.

Kubernetes probes
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

References
- deployment.md:1
