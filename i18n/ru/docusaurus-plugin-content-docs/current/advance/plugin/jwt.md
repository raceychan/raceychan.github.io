---
title: jwt
---

## Lihil поставляется с плагинами аутентификации и авторизации из коробки.

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

> Когда вы возвращаете `UserProfile` из эндпоинта `login_get_token`, он автоматически сериализуется как JSON Web Token.

### Авторизация с зависимостью функции

```python
def is_admin(profile: Annotated[UserProfile, JWTAuthParam]) -> bool:
    return profile.role == "admin"

@me.get(auth_scheme=OAuth2PasswordFlow(token_url="token"), plugins=[jwt_auth_plugin.decode_plugin()])
async def get_admin_user(profile: Annotated[UserProfile, JWTAuthParam], _: Annotated[bool, use(is_admin)]) -> User:
    return User(name="user", email="user@email.com")
```

### Кодирование/декодирование строкового значения как JWT

```python
@token.post(plugins=[jwt_auth_plugin.encode_plugin(expires_in_s=3600)])
async def login_get_token(credentials: OAuthLoginForm) -> str:
    return "user123"
```

## JWTConfig

Для использования `JWTAuthPlugin` вам необходимо предоставить секретный ключ JWT и алгоритм.

Вы можете сделать это, создав экземпляр `JWTConfig` и передав его в `Lihil`:

```python
from lihil.config import lhl_read_config
from lihil.plugins.auth.jwt import JWTConfig


config = lhl_read_config(".env", config_type=JWTConfig)
lhl = Lihil(app_config=config)
```

где файл `.env` должен содержать:

```env
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
```

Альтернативно, вы можете использовать свой собственный класс конфигурации, реализующий интерфейс `IJWTConfig`:

```python
class MyConfig(BaseModel):
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
```

затем установить его как конфигурацию приложения
