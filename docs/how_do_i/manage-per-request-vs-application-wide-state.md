title: manage per-request vs. application-wide state
---
How to
- Application-wide: initialize in `lifespan` (runs once on startup) and store on the app; dispose on shutdown.
- Per-request: use async-generator dependencies; control reuse with `NodeConfig(reuse=False)` to ensure fresh instances.

Example
```python
from ididi import NodeConfig
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncConnection
from lihil import Route

async def get_conn(engine: AsyncEngine) -> AsyncConnection:
    async with engine.begin() as conn:
        yield conn

users = Route("/users", deps=[(get_conn, NodeConfig(reuse=False))])
```

References
- http/lifespan.md:1
- http/endpoint.md:1
