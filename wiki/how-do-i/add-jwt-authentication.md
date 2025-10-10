---
title: add JWT authentication
---

How to
- Use `JWTAuthPlugin` and annotate parameters with `JWTAuthParam`.
- Use `OAuth2PasswordFlow` for token acquisition and return a profile to be encoded as JWT.

Example
```python
from typing import Annotated, Literal
from msgspec import Struct, field
from lihil import Route
from lihil.plugins.auth.jwt import JWTAuthParam, JWTAuthPlugin
from lihil.plugins.auth.oauth import OAuth2PasswordFlow, OAuthLoginForm

me = Route("/me")
token = Route("/token")

jwt_auth_plugin = JWTAuthPlugin(jwt_secret="mysecret", jwt_algorithms="HS256")

class UserProfile(Struct):
    user_id: str = field(name="sub")
    role: Literal["admin", "user"] = "user"

@me.get(auth_scheme=OAuth2PasswordFlow(token_url="token"), plugins=[jwt_auth_plugin.decode_plugin()])
async def get_user(profile: Annotated[UserProfile, JWTAuthParam]):
    return {"sub": profile.user_id}

@token.post(plugins=[jwt_auth_plugin.encode_plugin(expires_in_s=3600)])
async def login_get_token(credentials: OAuthLoginForm) -> UserProfile:
    return UserProfile(user_id="user123")
```

References
- advance/plugin/jwt.md:1
