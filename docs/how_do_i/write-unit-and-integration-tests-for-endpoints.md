---
title: write unit and integration tests for endpoints
---

How to
- Use `TestClient` for integration-style tests that go through the full stack.

Example
```python
from lihil import Lihil, Route
from lihil.vendors import TestClient

r = Route("/hello")

@r.get
async def hello() -> str:
    return "ok"

lhl = Lihil(r)
client = TestClient(lhl)

def test_get():
    res = client.get("/hello")
    assert res.status_code == 200
    assert res.json() == "ok"
```

Refs for SSE testing and more examples
- testing.md:1
