title: use path, query, header, and cookie parameters
---
How to
- Path: parameter name appears in route path, e.g. `/users/{user_id}` → `user_id`.
- Query: simple scalars default to query if not otherwise marked.
- Header/Cookie: use `Annotated[T, Param("header"|"cookie", alias=...)]`.
- Implicit rules and constraints are described in ../http/endpoint.md and ../http/request/*.

Example
```python
from typing import Annotated
from lihil import Route, Param

route = Route("/users/{user_id}")

@route.get
async def get_user(
    user_id: int,                          # path
    q: str | None = None,                  # query
    auth: Annotated[str, Param("header", alias="Authorization")],
    session_id: Annotated[str, Param("cookie")],
) -> dict:
    return {"user_id": user_id, "q": q, "auth": auth, "session": session_id}
```

References
- http/endpoint.md:1
- http/request/path.md:1
- http/request/query.md:1
- http/request/header.md:1
- http/request/cookie.md:1
