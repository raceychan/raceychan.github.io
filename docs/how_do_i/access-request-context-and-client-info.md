---
title: access request context and client info
---

How to
- Accept `IRequest` to access URL, headers, query params, cookies, client address, and read the body.

Example
```python
from lihil import Route
from lihil.interface import IRequest

meta = Route("/meta")

@meta.get
async def info(req: IRequest) -> dict:
    return {
        "path": str(req.url),
        "client": getattr(req.client, "host", None),
        "headers": dict(req.headers),
        "query": dict(req.query_params),
    }
```

References
- http/request/request.md:1
- http/endpoint.md:1
