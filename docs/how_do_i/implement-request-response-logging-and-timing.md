---
title: implement request/response logging and timing
---

How to
- Add a lightweight timing middleware that wraps the ASGI app, measures each request, and logs method/path/duration.

Example
```python
import time, logging
from lihil import Lihil

log = logging.getLogger(__name__)

def timing_mw(next_app):
    async def app(scope, receive, send):
        start = time.perf_counter()
        try:
            await next_app(scope, receive, send)
        finally:
            dur_ms = (time.perf_counter() - start) * 1000
            log.info("%s %s %.2fms", scope.get("method"), scope.get("path"), dur_ms)
    return app

lhl = Lihil(middlewares=[timing_mw])
```

References
- http/middleware.md:1
- http/lifespan.md:73
