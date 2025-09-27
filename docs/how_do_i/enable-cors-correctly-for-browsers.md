---
title: enable CORS correctly for browsers
---

How to
- Use Starlette CORS middleware with appropriate origins, methods, and headers.

Example
```python
from starlette.middleware.cors import CORSMiddleware
from lihil import Lihil

lhl = Lihil(
    middlewares=[
        lambda app: CORSMiddleware(
            app,
            allow_origins=["https://example.com"],
            allow_methods=["*"],
            allow_headers=["*"],
            allow_credentials=True,
        )
    ]
)
```

References
- http/middleware.md:1
