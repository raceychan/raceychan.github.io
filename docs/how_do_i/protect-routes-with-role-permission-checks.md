---
title: protect routes with role/permission checks
---

How to
- Add a function dependency (e.g., `is_admin`) and require it on the endpoint alongside the decoded JWT.

Example
```python
from typing import Annotated, Literal
from msgspec import Struct, field
from lihil import use
from lihil.plugins.auth.jwt import JWTAuthParam
from lihil.plugins.auth.oauth import OAuth2PasswordFlow

class UserProfile(Struct):
    user_id: str = field(name="sub")
    role: Literal["admin", "user"] = "user"

def is_admin(profile: Annotated[UserProfile, JWTAuthParam]) -> bool:
    return profile.role == "admin"

@me.get(auth_scheme=OAuth2PasswordFlow(token_url="token"))
async def admin_only(profile: Annotated[UserProfile, JWTAuthParam], _: Annotated[bool, use(is_admin)]) -> dict:
    return {"ok": True}
```

References
- advance/plugin/jwt.md:1
