---
title: JWT
---

## Lihilは認証・認可プラグインを開箱即用で提供します。

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

> `login_get_token`エンドポイントから`UserProfile`を返すと、自動的にJSON Web Tokenとしてシリアライズされます。

### 関数依存関係による認可

```python
def is_admin(profile: Annotated[UserProfile, JWTAuthParam]) -> bool:
    return profile.role == "admin"

@me.get(auth_scheme=OAuth2PasswordFlow(token_url="token"), plugins=[jwt_auth_plugin.decode_plugin()])
async def get_admin_user(profile: Annotated[UserProfile, JWTAuthParam], _: Annotated[bool, use(is_admin)]) -> User:
    return User(name="user", email="user@email.com")
```

### 文字列値をJWTとしてエンコード/デコード

```python
@token.post(plugins=[jwt_auth_plugin.encode_plugin(expires_in_s=3600)])
async def login_get_token(credentials: OAuthLoginForm) -> str:
    return "user123"
```

## JWTConfig

`JWTAuthPlugin`を使用するには、JWTシークレットキーとアルゴリズムを提供する必要があります。

`JWTConfig`インスタンスを作成し、`Lihil`に渡すことで実行できます：

```python
from lihil.config import lhl_read_config
from lihil.plugins.auth.jwt import JWTConfig


config = lhl_read_config(".env", config_type=JWTConfig)
lhl = Lihil(app_config=config)
```

`.env`ファイルは以下を含む必要があります：

```env
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
```

または、独自の設定クラスを使用し、`IJWTConfig`インターフェースを実装することもできます：

```python
class MyConfig(BaseModel):
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
```

その後、これをアプリ設定として設定します