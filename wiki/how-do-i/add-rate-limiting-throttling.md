---
title: add rate limiting / throttling
---

How to
- Use `PremierPlugin` from `lihil.plugins.premier` and choose a strategy (e.g., fixed window). Configure the backend/handler in lifespan.

Example
```python
from lihil import Lihil, Route
from lihil.plugins.premier import PremierPlugin, throttler, AsyncDefaultHandler

route = Route("/")

@route.get(plugins=[PremierPlugin(throttler).fix_window(quota=1, duration=1)])
async def hello():
    return "hello"

async def lifespan(app: Lihil):
    throttler.config(aiohandler=AsyncDefaultHandler())

lhl = Lihil(route, lifespan=lifespan)
```

References
- advance/plugin/throttling.md:1
