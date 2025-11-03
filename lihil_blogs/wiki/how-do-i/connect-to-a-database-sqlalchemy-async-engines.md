---
title: connect to a database (SQLAlchemy, async engines)
---

How to
- Create an `AsyncEngine` during startup in `lifespan`, dispose on shutdown.
- Provide per-request `AsyncConnection` as a dependency via an async generator.

Example
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, AsyncConnection
from lihil import Route, Lihil

async def lifespan(app: Lihil):
    app.engine = create_async_engine("sqlite+aiosqlite:///test.db")
    yield
    await app.engine.dispose()

async def get_conn(engine: AsyncEngine) -> AsyncConnection:
    async with engine.begin() as conn:
        yield conn

users = Route("/users", deps=[get_conn])
```

References
- http/lifespan.md:1
- http/endpoint.md:1
- index.md:65
