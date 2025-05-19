- Lihil comes with authentification & authorization plugins out of the box.

```python
from lihil import Payload, Route
from lihil.plugins.auth.jwt import JWTAuth, JWTPayload
from lihil.auth.oauth import OAuth2PasswordFlow, OAuthLoginForm

class UserProfile(JWTPayload):
    # get support from typehints about what are the available claims
    __jwt_claims__ = {"expires_in": 300}  # jwt expires in 300 seconds.

    user_id: str = field(name="sub")
    role: Literal["admin", "user"] = "user"

@me.get(auth_scheme=OAuth2PasswordFlow(token_url="token"))
async def get_user(profile: JWTAuth[UserProfile]) -> User:
    assert profile.role == "user"
    return User(name="user", email="user@email.com")

@token.post
async def create_token(credentials: OAuthLoginForm) -> JWTAuth[UserProfile]:
    return UserProfile(user_id="user123")
```

> When you return `UserProfile` from `create_token` endpoint, it would automatically be serialized as a json web token.

- JWTConfig

To use `JWTAuth`, you would need to provide jwt secret key and algorithm.

you can do this by creating a `JWTConfig` instance and passing it to `Lihil`:

```python
from lihil.config import lhl_read_config
from lihil.plugins.auth.jwt import JWTConfig


config = lhl_read_config(".env", config_type=JWTConfig)
lhl = Lihil(app_config=config)
```

where the `.env` file should contain:

```env
jwt_secret=your_secret_key
jwt_algorithm=HS256
```

Alternatively, you can use your own config class and implementing `IJWTConfig` interface:

```python
class MyConfig(BaseModel):
    jwt_secret: str
    jwt_algorithm: str = "HS256"
```

then set it as the app config
