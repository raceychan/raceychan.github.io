---
title: run code on startup/shutdown (lifespan hooks)
---
How to
- Provide an async context manager or async generator function as the app’s `lifespan`. Initialize resources on enter; clean up on exit.

Example
```python
from sqlalchemy.ext.asyncio import create_async_engine
from lihil import Lihil

async def lifespan(app: Lihil):
    engine = create_async_engine("sqlite+aiosqlite:///test.db")
    app.engine = engine
    # optional: verify service availability
    # await engine.execute(text("SELECT 1"))
    yield
    await engine.dispose()

lhl = Lihil(lifespan=lifespan)
```

References
- http/lifespan.md:1
