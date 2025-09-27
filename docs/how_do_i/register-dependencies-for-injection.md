---
title: register dependencies for injection
---

How to
- Register factories on the `Route` (via constructor `deps=[...]`) or via plugin mechanisms; inject by type in endpoint signature.
- Use async generators to manage per-request resources (open/yield/close).

Example
```python
from ididi import NodeConfig
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncConnection
from lihil import Route

async def get_conn(engine: AsyncEngine) -> AsyncConnection:
    async with engine.begin() as conn:
        yield conn

users = Route("/users", deps=[(get_conn, NodeConfig(reuse=False))])

@users.post
async def create_user(conn: AsyncConnection) -> dict:
    # use conn
    return {"ok": True}
```

References
- http/endpoint.md:1
- http/lifespan.md:1
- index.md:65
