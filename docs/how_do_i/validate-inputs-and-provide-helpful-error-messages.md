---
title: validate inputs and provide helpful error messages
---

How to
- Use `Annotated[..., Param(...)]` to add constraints to scalars and collections.
- Use structured types for body validation; invalid input returns 422 with detail.

Example
```python
from typing import Annotated
from lihil import Route, Param

search = Route("/search")

@search.get
async def find(limit: Annotated[int, Param(ge=1, le=100)], q: str) -> dict:
    return {"limit": limit, "q": q}
```

References
- http/endpoint.md:1
- http/request/*:1
- http/error-handling.md:1
