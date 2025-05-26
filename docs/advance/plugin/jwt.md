---
title: jwt
---

## Lihil comes with authentification & authorization plugins out of the box.

```python
from lihil import Payload, Route
from lihil.plugins.auth.jwt import JWTAuthParam, JWTAuthPlugin, JWTConfig
from lihil.plugins.auth.oauth import OAuth2PasswordFlow, OAuthLoginForm

jwt_auth_plugin = JWTAuthPlugin(jwt_secret="mysecret", jwt_algorithms="HS256")

class UserProfile(Struct):
    user_id: str = field(name="sub")
    role: Literal["admin", "user"] = "user"

@me.get(auth_scheme=OAuth2PasswordFlow(token_url="token"), plugins=[jwt_auth_plugin.decode_plugin])
async def get_user(profile: Annotated[UserProfile, JWTAuthParam]) -> User:
    assert profile.role == "user"
    return User(name="user", email="user@email.com")

@token.post(plugins=[jwt_auth_plugin.encode_plugin(expires_in_s=3600)])
async def create_token(credentials: OAuthLoginForm) -> UserProfile:
    return UserProfile(user_id="user123")
```

> When you return `UserProfile` from `create_token` endpoint, it would automatically be serialized as a json web token.

## JWTConfig

To use `JWTAuthPlugin`, you would need to provide jwt secret key and algorithm.

you can do this by creating a `JWTConfig` instance and passing it to `Lihil`:

```python
from lihil.config import lhl_read_config
from lihil.plugins.auth.jwt import JWTConfig


config = lhl_read_config(".env", config_type=JWTConfig)
lhl = Lihil(app_config=config)
```

where the `.env` file should contain:

```env
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
```

Alternatively, you can use your own config class and implementing `IJWTConfig` interface:

```python
class MyConfig(BaseModel):
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
```

then set it as the app config
