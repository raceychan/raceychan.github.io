---
title: test async code and dependency-injected services
---

How to
- Use `LocalClient` to call endpoints/functions locally with DI and minimal boilerplate.

Example
```python
from lihil import LocalClient

async def test_endpoint_with_localclient():
    async def func(name: tuple[str, ...]):
        assert name == ("aloha",)

    lc = LocalClient()
    resp = await lc.call_endpoint(lc.make_endpoint(func))
    await resp.body()
```

References
- testing.md:1
