---
title: テスト
sidebar_position: 3
---

# テスト

Lihilは2つのテスト技術を提供します：`TestClient`と`LocalClient`

## `TestClient`

`TestClient`は、手動でクライアントとしてリクエストを構築し、サーバーに投稿することに近いものを提供します。

各リクエストがアプリケーションのすべての部分を通るべき統合テストでは、`TestClient`はテストをユーザーの行動に近づけます。

`TestClient`を使用するには、`httpx`をインストールする必要があることに注意してください。


## `LocalClient`

より簡潔で粒度の細かい機能が必要な場合は、`LocalClient`をチェックしてください。

`TestClient`とは対照的に、`LocalClient`は完全なリクエストクライアントというよりもテストヘルパーであり、`Lihil`インスタンス、`Route`、`Endpoint`を高速で人間工学的な方法でローカルで呼び出すために使用できます。


### 任意の関数をエンドポイントのようにテスト：

```python
from lihil import LocalClient

async def test_query_with_default():
    async def func(name: tuple[str, ...]) -> Empty:
        assert name == ("aloha",)

    lc = LocalClient()

    resp = await lc.call_endpoint(lc.make_endpoint(func))
    await resp.body()
```

### LocalClientで複雑なフローをテスト

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