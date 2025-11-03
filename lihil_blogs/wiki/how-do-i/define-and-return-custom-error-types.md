---
title: define and return custom error types
---

How to
- Inherit from `HTTPException[T]`, set `__status__`, and optionally declare with `errors=` on endpoints.

Example
```python
from lihil.errors import HTTPException
from lihil import Route

class VioletsAreBlue(HTTPException[str]):
    __status__ = 418

r = Route("/demo")

@r.get(errors=VioletsAreBlue)
async def roses_are_red():
    raise VioletsAreBlue("I am a pythonista")
```

References
- http/error-handling.md:1
