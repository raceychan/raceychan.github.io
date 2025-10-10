---
title: stream large responses or server-sent events
---

How to
- For SSE: yield `SSE` values and annotate return type as `EventStream`; the framework encodes and streams per spec.

Example
```python
from lihil import Route, SSE, EventStream

sse = Route("/sse")

@sse.get
async def events() -> EventStream:
    yield SSE(data={"message": "Hello"}, event="start", id="1")
```

References
- http/response.md:1
