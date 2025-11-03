---
title: add middleware for CORS, compression, or auth
---

How to
- Pass ASGI middleware factories to `Lihil(middlewares=[...])` or `Route.add_middleware(...)`.
- For CORS, reuse Starlette middleware. For auth, see JWT plugin.

Examples
```python
from starlette.middleware.cors import CORSMiddleware
from lihil import Lihil

lhl = Lihil(middlewares=[lambda app: CORSMiddleware(app, allow_origins=["*"], allow_methods=["*"])])
```

```python
# Custom timing/logging middleware pattern
import time, logging
log = logging.getLogger(__name__)

def timing_mw(next_app):
    async def app(scope, receive, send):
        start = time.perf_counter()
        try:
            await next_app(scope, receive, send)
        finally:
            dur = (time.perf_counter() - start) * 1000
            log.info("%s %s %.2fms", scope.get("method"), scope.get("path"), dur)
    return app

lhl = Lihil(middlewares=[timing_mw])
```

References
- http/middleware.md:1
- advance/plugin/jwt.md:1
