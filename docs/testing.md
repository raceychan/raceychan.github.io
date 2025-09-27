---
title: Testing
sidebar_position: 3.5
---

# Testing

Lihil provide you two techniques for testing, `TestClient` and `LocalClient`

## `TestClient`

`TestClient` provide you something that is close to manually constructing a request as client and post it to your server.

For integration testing where each request should go through every part of your application, `TestClient` keep your test close to user behavior.

Note that to use `TestClient`, you would need to install `httpx`.

### Test SSE endpoints with `TestClient`

For endpoints that stream Server‑Sent Events (SSE), iterate the streamed body line‑by‑line and assert on the assembled message.

```python
from lihil import Lihil, Route, SSE, EventStream
from lihil.vendors import TestClient


def test_endpoint_with_sse():
    async def sse_endpoint() -> EventStream:
        yield SSE(data={"message": "Hello, SSE!"}, event="start")
        for i in range(3):
            yield SSE(data={"count": i}, event="update", id=str(i))
        yield SSE(data={"message": "Goodbye!"}, event="close", id="final")

    sse_route = Route("/sse")
    sse_route.get(sse_endpoint)
    lhl = Lihil(sse_route)

    client = TestClient(lhl)
    response = client.get("/sse")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")

    # Read the streamed response line by line
    lines: list[str] = []
    for line in response.iter_lines():
        if line:  # skip empty lines
            lines.append(line)

    # Join lines back into a single message for validation
    message = "\n".join(lines) + "\n\n"  # add final blank line

    # Check that expected events are present
    assert "event: start" in message
    assert 'data: {"message":"Hello, SSE!"}' in message
    for i in range(3):
        assert "event: update" in message
        assert f"id: {i}" in message
        assert f'data: {{"count":{i}}}' in message
    assert "event: close" in message
    assert 'data: {"message":"Goodbye!"}' in message

    # Optional: if you have a helper
    # from tests.helpers import is_valid_sse
    # assert is_valid_sse(message)
```


## `LocalClient`

if you want something less verbose and with smaller granularity, you can check out `LocalClient`,

`LocalClient` is more a test helper than a full-fledged request client as opposed to `TestClient`, you might use it to call `Lihil` instance, `Route`, and `Endpoint` locally in a fast and ergonomic manner.


### Test any function as if it were an endpoint:

```python
from lihil import LocalClient

async def test_query_with_default():
    async def func(name: tuple[str, ...]) -> Empty:
        assert name == ("aloha",)

    lc = LocalClient()

    resp = await lc.call_endpoint(lc.make_endpoint(func))
    await resp.body()
```

### Test a complex flow with LocalCLient

```python
async def test_endpoint_login_and_validate(testroute: Route, lc: LocalClient):
    from lihil.config import lhl_set_config

    async def get_me(token: JWTAuth[UserProfile]) -> Annotated[Text, status.OK]:
        assert token.user_id == "1" and token.user_name == "2"
        return "ok"

    async def login_get_token(login_form: OAuthLoginForm) -> JWTAuth[UserProfile]:
        return UserProfile(user_id="1", user_name="2")

    testroute.get(auth_scheme=OAuth2PasswordFlow(token_url="token"))(get_me)
    testroute.post(login_get_token)
    lhl_set_config(
        app_config=AppConfig(
            security=SecurityConfig(jwt_secret="mysecret", jwt_algorithms=["HS256"])
        )
    )
    testroute.setup()

    login_ep = testroute.get_endpoint(login_get_token)

    res = await lc.submit_form(
        login_ep, form_data={"username": "user", "password": "test"}
    )

    token_data = await res.json()

    token_type, token = token_data["token_type"], token_data["access_token"]
    token_type: str

    lc.update_headers({"Authorization": f"{token_type.capitalize()} {token}"})

    meep = testroute.get_endpoint(get_me)

    res = await lc(meep)

    assert res.status_code == 200
    assert await res.text() == "ok"
```
