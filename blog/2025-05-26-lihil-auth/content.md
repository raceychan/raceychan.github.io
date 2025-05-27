---
slug: lihil-auth
title: Set Up User Authentication in Minutes — With or Without a Standalone Database Using lihil-auth
authors: [raceychan]
tags: [WebDevelopment, Authentication]
toc_min_heading_level: 2
toc_max_heading_level: 5
---

As someone who has worked on multiple web projects, I’ve found user authentication to be a recurring pain point. Whether I was integrating a third-party auth provider like Supabase, or worse — rolling my own auth system — I often found myself rewriting the same boilerplate:

- Configuring JWTs

- Decoding tokens from headers
- Serializing them back
- Hashing passwords
- Validating login credentials

And that’s not even touching error handling, route wiring, or OpenAPI documentation.

So I built lihil-auth, a plugin system that makes user authentication a breeze. It supports both third-party platforms like `Supabase` and self-hosted solutions using JWT — with minimal effort.

### Supabase Auth in One Line

If you're using Supabase, setting up authentication is as simple as:

```python
from lihil import Lihil
from lihil.plugins.auth.supabase import signin_route_factory, signup_route_factory

app = Lihil()
app.include_routes(
    signin_route_factory(route_path="/login"),
    signup_route_factory(route_path="/signup"),
)
```

These routes immediately become available in your OpenAPI docs (/docs), allowing you to explore, debug, and test them interactively(thanks to swagger-ui):

![Supabase Routes](./openapi_supabase_routes.png)
![Supabase debug](./openapi_supabase_debug.png)

With just that, you have a ready-to-use login route backed by Supabase.

#### Full docs: [Supabase Plugin Documentation](https://lihil.cc/docs/advance/plugin/supabase)

### Want to use Your Own Database?

No problem. The JWT plugin lets you manage users and passwords your own way, while lihil takes care of encoding/decoding JWTs and injecting them as typed objects.

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

@me.get(auth_scheme=OAuth2PasswordFlow(token_url="token"), plugins=[jwt_auth_plugin.decode_plugin])
async def get_user(profile: Annotated[UserProfile, JWTAuthParam]) -> User:
    assert profile.role == "user"
    return User(name="user", email="user@email.com")

@token.post(plugins=[jwt_auth_plugin.encode_plugin(expires_in_s=3600)])
async def login_get_token(credentials: OAuthLoginForm) -> UserProfile:
    return UserProfile(user_id="user123")
```

#### Role-Based Authorization Example

```python
def is_admin(profile: Annotated[UserProfile, JWTAuthParam]) -> bool:
    return profile.role == "admin"

@me.get(auth_scheme=OAuth2PasswordFlow(token_url="token"), plugins=[jwt_auth_plugin.decode_plugin])
async def get_admin_user(profile: Annotated[UserProfile, JWTAuthParam], _: Annotated[bool, use(is_admin)]) -> User:
    return User(name="user", email="user@email.com")
```

#### Returning Simple String Tokens

```python
@token.post(plugins=[jwt_auth_plugin.encode_plugin(expires_in_s=3600)])
async def login_get_token(credentials: OAuthLoginForm) -> str:
    return "user123"
```

#### Full docs: [JWT Plugin Documentation](https://lihil.cc/docs/advance/plugin/jwt)

## Installation

### To use jwt only

```bash
pip install "lihil[standard]"
```

### To use both jwt and supabase

```bash
pip install "lihil[standard,supabase]"
```

---

Github: [lihil](https://github.com/raceychan/lihil)

Official Docs: [lihil.cc](https://lihil.cc)
