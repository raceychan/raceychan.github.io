---
title: 测试
sidebar_position: 3
---

# 测试

Lihil 为你提供两种测试技术：`TestClient` 和 `LocalClient`

## `TestClient`

`TestClient` 为你提供类似于手动构造客户端请求并将其发送到服务器的功能。

对于集成测试，每个请求都应该经过应用程序的每个部分，`TestClient` 让你的测试更接近用户行为。

注意，要使用 `TestClient`，你需要安装 `httpx`。


## `LocalClient`

如果你想要更简洁、粒度更小的功能，你可以查看 `LocalClient`。

与 `TestClient` 相比，`LocalClient` 更像是一个测试助手而不是一个完整的请求客户端，你可以使用它以快速、符合人体工程学的方式在本地调用 `Lihil` 实例、`Route` 和 `Endpoint`。


### 测试任何函数，就像它是一个端点一样：

```python
from lihil import LocalClient

async def test_query_with_default():
    async def func(name: tuple[str, ...]) -> Empty:
        assert name == ("aloha",)

    lc = LocalClient()

    resp = await lc.call_endpoint(lc.make_endpoint(func))
    await resp.body()
```

### 使用 LocalClient 测试复杂流程

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