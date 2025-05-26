---
title: throttling
---

# Throttling

lihil uses [`premier`](https://github.com/raceychan/premier/tree/master) for throttling.

premier is an intuitive throttler that supports various backends and throttling algorihms, it can be used in distributed application for throttling web-api and any regular function.

## Premier plugin

```python
from lihil import Lihil, Route
from lihil.plugins.premier import PremierPlugin, throttler, AsyncDefaultHandler, throttler


root = Route()

@route.get(plugins=[PremierPlugin(throttler).fix_window(quota=1, duration=1)])
async def hello():
    return "hello"


async def lifespan():
    throttler.config(aiohandler=AsyncDefaultHandler())


lhl = Lihil(lifespan=lifespan, routes=[root])
```

This would create a throttler that allows 1 request per second.

checkout premier documentation for more details on how to configure the throttler, and different throttling strategy & backends.
