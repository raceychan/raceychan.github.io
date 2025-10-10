---
title: run background tasks or scheduled jobs
---

How to
- Start periodic or long-running tasks from `lifespan` using `asyncio.create_task(...)`. Cancel and await on shutdown.

Example
```python
import asyncio

async def schedule_tasks():
    while True:
        # do work
        await asyncio.sleep(60)

async def lifespan(app):
    task = asyncio.create_task(schedule_tasks())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
```

References
- http/lifespan.md:1
