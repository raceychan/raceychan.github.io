---
title: define GET/POST/PUT/DELETE endpoints
---

How to
- Create a `Route(path)` and register handlers with `@route.get`, `@route.post`, `@route.put`, `@route.delete`.
- Handlers can declare parameters (path/query/header/cookie/body) and dependencies; returns are serialized per ../http/response.md.

Example
```python
from lihil import Route

users = Route("/users")

@users.get
async def list_users() -> list[str]:
    return ["alice", "bob"]

@users.post
async def create_user(name: str) -> dict:
    return {"created": name}

@users.put
async def replace_user(user_id: int, name: str) -> dict:
    return {"id": user_id, "name": name}

@users.delete
async def remove_user(user_id: int) -> dict:
    return {"removed": user_id}
```

References
- http/route.md:1
- http/endpoint.md:1
