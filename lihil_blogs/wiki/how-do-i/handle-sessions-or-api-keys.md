title: handle sessions or API keys
---

How to
- Set session cookies by returning a `Response` and calling `set_cookie`.
- Read API keys or session IDs from headers/cookies using `Param`.
- Apply the same logic in an outermost plugin: wrap the endpoint, then return a `Response` from the plugin.

Examples
```python
from typing import Annotated
from msgspec import Struct
from lihil import Route, Param
from lihil.vendors import Response

auth = Route("/auth")

class LoginForm(Struct):
    username: str
    password: str

# 1) Endpoint sets a session cookie directly
@auth.post
async def login(form: LoginForm) -> Response:
    # validate credentials, create a session
    session_id = create_session_for_user(form.username)

    # return a low-level Response so we can set cookies/headers explicitly
    resp = Response(status_code=204)  # empty body; cookie carries session
    resp.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
        max_age=7 * 24 * 3600,
    )
    return resp

# Later endpoints can read the cookie
@auth.get
async def me(
    session_id: Annotated[str, Param("cookie")],
) -> dict:
    user = get_user_by_session(session_id)
    return {"user": user.username}

# 2) Attach the cookie in an outermost plugin that returns a Response
from functools import wraps
from typing import Any

class SetSessionCookiePlugin:
    def __init__(self, cookie_name: str = "session_id", *, max_age: int | None = 7 * 24 * 3600):
        self.cookie_name = cookie_name
        self.max_age = max_age

    def __call__(self, ep_info):  # IEndpointInfo[P, R]
        func = ep_info.func

        @wraps(func)
        async def wrapped(*args: Any, **kwargs: Any):
            # Expect the endpoint to return the new session id
            session_id = await func(*args, **kwargs)
            resp = Response(status_code=204)
            resp.set_cookie(
                key=self.cookie_name,
                value=str(session_id),
                httponly=True,
                secure=True,
                samesite="lax",
                path="/",
                max_age=self.max_age,
            )
            return resp

        return wrapped

@auth.post(plugins=[SetSessionCookiePlugin()])
async def login_and_return_session(form: LoginForm) -> str:
    # validate credentials and return a session id; plugin sets the cookie
    return create_session_for_user(form.username)

# 3) API keys via header or cookie
api = Route("/api")

@api.get
async def list_items(
    api_key: Annotated[str, Param("header", alias="X-API-Key")],
) -> list[str]:
    if not is_valid_key(api_key):
        return Response("unauthorized", status_code=401)
    return ["a", "b", "c"]

# Or enforce with a plugin that can short-circuit by returning a Response
class RequireApiKey:
    def __init__(self, valid_keys: set[str], param_name: str = "api_key"):
        self.valid_keys = valid_keys
        self.param_name = param_name

    def __call__(self, ep_info):  # IEndpointInfo[P, R]
        func = ep_info.func

        @wraps(func)
        async def wrapped(*args: Any, **kwargs: Any):
            key = kwargs.get(self.param_name)
            if key not in self.valid_keys:
                return Response("unauthorized", status_code=401)
            return await func(*args, **kwargs)

        return wrapped

@api.get(plugins=[RequireApiKey({"secret-123"})])
async def list_items_secure(
    api_key: Annotated[str, Param("header", alias="X-API-Key")],
) -> list[str]:
    return ["a", "b", "c"]
```

Notes
- Import low-level `Response` from `lihil.vendors`. When an endpoint (or plugin) returns a `Response`, lihil sends it as-is; return marks and status annotations are ignored for that response.
- For session cookies, prefer `HttpOnly`, `Secure` (HTTPS), and an appropriate `SameSite` value; set `path` and `max_age`/`expires` as needed.
- Read session IDs or API keys from `Param("cookie")` or `Param("header")` in endpoints that need them.

References
- docs/http/response.md:1
- docs/advance/plugin/plugin.md:1
- wiki/how-do-i/use-path-query-header-and-cookie-parameters.md:1
- docs/http/request/cookie.md:1
- docs/http/error-handling.md:1
