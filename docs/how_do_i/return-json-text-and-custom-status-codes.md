---
title: return JSON, text, and custom status codes
---

How to
- Default: return value is JSON-serialized.
- Use return marks (`Text`, `HTML`, `Stream`, `Empty`) to change content type/shape.
- Use status annotations: `Annotated[T, status.Created]` etc.

Examples
```python
from typing import Annotated
from lihil import Text, status

async def hello() -> Text:
    return "hello"

async def created() -> Annotated[dict, status.Created]:
    return {"ok": True}
```

References
- http/response.md:1
