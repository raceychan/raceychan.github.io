---
title: JWT
---

## Lihil 开箱即用地提供认证和授权插件。

```python
from lihil import Payload, Route
from lihil.plugins.auth.jwt import JWTAuthParam, JWTAuthPlugin, JWTConfig
from lihil.plugins.auth.oauth import OAuth2PasswordFlow, OAuthLoginForm

me = Route("/me")
token = Route("/token")

jwt_auth_plugin = JWTAuthPlugin(jwt_secret="mysecret", jwt_algorithms="HS256")

class UserProfile(Struct):
    user_id: str = field(name="sub")
    role: Literal["admin", "user"] = "user"

@me.get(auth_scheme=OAuth2PasswordFlow(token_url="token"), plugins=[jwt_auth_plugin.decode_plugin()])
async def get_user(profile: Annotated[UserProfile, JWTAuthParam]) -> User:
    assert profile.role == "user"
    return User(name="user", email="user@email.com")

@token.post(plugins=[jwt_auth_plugin.encode_plugin(expires_in_s=3600)])
async def login_get_token(credentials: OAuthLoginForm) -> UserProfile:
    return UserProfile(user_id="user123")
```

> 当你从 `login_get_token` 端点返回 `UserProfile` 时，它会自动序列化为 JSON Web Token。

### 使用函数依赖进行授权

```python
def is_admin(profile: Annotated[UserProfile, JWTAuthParam]) -> bool:
    return profile.role == "admin"

@me.get(auth_scheme=OAuth2PasswordFlow(token_url="token"), plugins=[jwt_auth_plugin.decode_plugin()])
async def get_admin_user(profile: Annotated[UserProfile, JWTAuthParam], _: Annotated[bool, use(is_admin)]) -> User:
    return User(name="user", email="user@email.com")
```

### 将字符串值编码/解码为 JWT

```python
@token.post(plugins=[jwt_auth_plugin.encode_plugin(expires_in_s=3600)])
async def login_get_token(credentials: OAuthLoginForm) -> str:
    return "user123"
```

## JWTConfig

要使用 `JWTAuthPlugin`，你需要提供 JWT 密钥和算法。

你可以通过创建 `JWTConfig` 实例并将其传递给 `Lihil` 来做到这一点：

```python
from lihil.config import lhl_read_config
from lihil.plugins.auth.jwt import JWTConfig


config = lhl_read_config(".env", config_type=JWTConfig)
lhl = Lihil(app_config=config)
```

其中 `.env` 文件应包含：

```env
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
```

或者，你可以使用自己的配置类并实现 `IJWTConfig` 接口：

```python
class MyConfig(BaseModel):
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
```

然后将其设置为应用配置