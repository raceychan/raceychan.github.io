---
title: Тестирование
sidebar_position: 3
---

# Тестирование

Lihil предоставляет вам два метода для тестирования: `TestClient` и `LocalClient`

## `TestClient`

`TestClient` предоставляет вам что-то близкое к ручному созданию запроса как клиент и отправке его на ваш сервер.

Для интеграционного тестирования, где каждый запрос должен проходить через каждую часть вашего приложения, `TestClient` сохраняет ваш тест близким к поведению пользователя.

Обратите внимание, что для использования `TestClient` вам необходимо установить `httpx`.


## `LocalClient`

если вы хотите что-то менее многословное и с меньшей детализацией, вы можете изучить `LocalClient`,

`LocalClient` больше помощник для тестирования, чем полноценный клиент запросов в отличие от `TestClient`, вы можете использовать его для вызова экземпляра `Lihil`, `Route` и `Endpoint` локально быстрым и эргономичным способом.


### Тестируйте любую функцию как если бы она была endpoint:

```python
from lihil import LocalClient

async def test_query_with_default():
    async def func(name: tuple[str, ...]) -> Empty:
        assert name == ("aloha",)

    lc = LocalClient()

    resp = await lc.call_endpoint(lc.make_endpoint(func))
    await resp.body()
```

### Тестирование сложного потока с LocalClient

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
