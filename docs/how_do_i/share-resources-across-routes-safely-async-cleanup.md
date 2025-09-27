---
title: share resources across routes safely (async + cleanup)
---

How to
- Create app-wide singletons in `lifespan` (e.g., database engine, Kafka producer) and clean them up on shutdown.
- Provide per-request resources via async-generator dependencies that open/yield/close per call.

Example
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, AsyncConnection
from lihil import Lihil, Route

async def lifespan(app: Lihil):
    app.engine = create_async_engine("sqlite+aiosqlite:///test.db")
    yield
    await app.engine.dispose()

async def get_conn(engine: AsyncEngine) -> AsyncConnection:
    async with engine.begin() as conn:
        yield conn

r = Route("/users", deps=[get_conn])
```

References
- http/lifespan.md:1
- http/endpoint.md:1
