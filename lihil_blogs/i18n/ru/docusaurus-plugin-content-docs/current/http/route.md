---
sidebar_position: 2
title: маршрут
---

Когда вы определяете маршрут, вы предоставляете ресурс через конкретный **путь**, который клиенты могут запросить. Затем вы добавляете `Endpoint` к маршруту, чтобы определить, что клиенты могут делать с ресурсом.

Возьмем URL `https://dontclickme.com/users` в качестве примера, путь `/users` будет указывать на ресурс `users`.

## Определение маршрута

```python
from lihil import Route

users_route = Route("/users")
```

Если у вас есть существующие `lihil.Graph` и `lihil.MessageRegistry`, которые вы хотели бы использовать, поместите их в конструктор маршрута.

Это полезно, если вы храните зависимости и слушатели событий в отдельных файлах, например:

```python
from project.users.deps import user_graph
from project.users.listeners import user_eventregistry

user_route = Route(graph=uesr_graph, registry=user_eventregistry)
```

Вы также можете добавить middleware к маршруту, если хотите, чтобы они применялись только к этому конкретному маршруту.

```python
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

Route(middlewares=[CORSMiddleware])
route.add_middleware(HTTPSRedirectMiddleware)
```

### Регистрация endpoint'а в маршруте.

В предыдущем обсуждении мы предоставили `create_user` как endpoint для `POST` запроса `users_route`.
мы также можем объявить другие HTTP-методы с похожим синтаксисом, включая:

| Метод     | Идемпотентный | Назначение                                          | Пример           |
| --------- | ------------- | --------------------------------------------------- | ---------------- |
| `GET`     | Да            | Получить данные без изменения состояния сервера    | `@route.get`     |
| `POST`    | Нет           | Отправить данные для создания ресурса или вызова действия | `@route.post`    |
| `HEAD`    | Да            | То же, что GET, но возвращает только заголовки     | `@route.head`    |
| `OPTIONS` | Да            | Обнаружить разрешенные методы и информацию о CORS  | `@route.options` |
| `TRACE`   | Да            | Отправить полученный запрос обратно (для отладки)  | `@route.trace`   |
| `PUT`     | Да            | Заменить ресурс предоставленными данными           | `@route.put`     |
| `DELETE`  | Да            | Удалить ресурс                                     | `@route.delete`  |
| `PATCH`   | Нет           | Применить частичные изменения к ресурсу            | `@route.patch`   |
| `CONNECT` | Нет           | Установить туннель к серверу (например, HTTPS)     | `@route.connect` |

Это означает, что маршрут может иметь 0-9 endpoint'ов.

чтобы предоставить функцию для нескольких HTTP-методов

- применить несколько декораторов к функции

- или, что эквивалентно, использовать `Route.add_endpoint`

```python
users_route.add_endpoint("GET", "POST", ...,  create_user)
```

## Определение подмаршрута

В предыдущем обсуждении мы создали маршрут для `users`, коллекции пользовательского ресурса,
чтобы предоставить конкретный пользовательский ресурс,

```python
user_route = users_route.sub("{user_id}")

@user_route.get
async def get_user(user_id: str, limit: int = 1): ...
```

Здесь
мы определяем подмаршрут `users_route`, когда мы включаем маршрут в наш `Lihil`, все его подмаршруты также будут включены рекурсивно.

Route.sub идемпотентен, вы можете вызывать его с одним и тем же путем несколько раз.

```python
@users_route.sub("{user_id}").get
async def get_user(user_id: str, limit: int = 1): ...

@users_route.sub("{user_id}").put
async def update_user(data: UserUpdate): ...
```

Здесь и `get_user`, и `update_user` находятся под одним и тем же маршрутом.

## включение подмаршрутов

Для больших приложений обычно люди сначала создают подмаршруты, а затем включают их в родительские маршруты, для этого используйте `Route.include_subroutes`

```python
parent = Route("/parent")
sub = Route("/sub")

parent.include_subroutes(sub)
assert parent.subroutes[0].path == "/parent/sub"
```

Разница между `Route.sub` и `Route.include_subroutes` заключается в том, что,

- `Route.sub` создает новый пустой маршрут на основе пути строкового типа
- `Route.include_subroutes` рекурсивно включает существующие маршруты как подмаршруты, пересоздает их на основе их свойств (endpoint'ы, middleware и т.д.)

Рекомендуется создавать файл для каждого маршрута,

```python title="api/cart/items.py"
items = Route("/items")

@items.get
def list_items(): ...

@items.sub("/{item_id}").get
def get_item(item_id: str) :...
```

затем создать родительский маршрут в `__init__.py` папки и включить подмаршруты

```python title="api/cart/__init__.py"
from .items import items

carts = Route("/carts")
carts.include_subroutes(items)
```

## Корневой маршрут

Маршрут с путем `/` является корневым маршрутом, если не предоставлен, корневой маршрут создается с `Lihil` по умолчанию, все, что зарегистрировано через `Lihil.{http method}`, находится под корневым маршрутом.

Следующие примеры функционально одинаковы

1. использовать экземпляр `Lihil` как корневой маршрут

```python
lhl = Lihil()
@lhl.get
async def hello():
    return "hello, world"
```

2. создать корневой маршрут, затем включить его в ваш экземпляр `Lihil`

```python
root = Route()

@root.get
async def hello():
    return "hello, world"
lhl = Lihil(root)
```